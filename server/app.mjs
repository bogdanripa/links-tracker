import express from "express";
import { AuthService } from "@genezio/auth";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

mongoose.connect(process.env["MY_MONGO_DB_DATABASE_URL"]);

const Links = mongoose.model("Links", new mongoose.Schema({
  owner: String,
  url: String,
  totalViews: Number,
  totalUniqueViewers: Number,
}));

const TrackedLinks = mongoose.model("TrackedLinks", new mongoose.Schema({
  owner: String,
  viewerName: String,
  linkId: String,
  url: String,
  totalViews: Number,
  totalUniqueViewers: Number,
}));

const Visits = mongoose.model("Visits", new mongoose.Schema({
  trackedLinkId: String,
  ip: String,
  fistVisit: Boolean,
  timestamp: Date,
  device: String,
  viewerName: String,
}));

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

async function checkAuth(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.user = await AuthService.getInstance().userInfoForToken(token);
    next();
  } catch (error) {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
}

app.get('/links/', checkAuth, async function (req, res, _next) {
  try {
    const links = await Links.find({ owner:  req.user.email});
    res.json(links);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

app.get('/links/:id', checkAuth, async function (req, res, _next) {
  try {
    const link = await Links.findOne({ _id: req.params.id, owner: req.user.email });
    if (!link) {
      res.status(404).send();
      return;
    }
    const trackedLinks = await TrackedLinks.find({ linkId: req.params.id, owner: req.user.email });
    res.json({
      link,
      trackedLinks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

app.post('/links/', checkAuth, async function (req, res, _next) {
  if (!req.body.url) {
    res.status(400).send({
      message: "url is required",
    });
    return;
  }
  try {
    const link = new Links({ owner: req.user.email, url: req.body.url, totalViews: 0, totalUniqueViewers: 0 });
    await link.save();
    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

app.delete('/links/:id', checkAuth, async function (req, res, _next) {
  try {
    const promises = [];
    promises.push(Links.deleteOne({ _id: req.params.id, owner: req.user.email }));
    const trackedLinks = await TrackedLinks.find({ linkId: req.params.id, owner: req.user.email });
    for (const trackedLink in trackedLinks) {
      promises.push(Visits.deleteMany({ trackedLinkId: trackedLink._id }));
    }
    promises.push(TrackedLinks.deleteMany({ linkId: req.params.id, owner: req.user.email }));
    await Promise.all(promises);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

const generateUniqueShortId = () => {
  const randomPart = Math.random().toString(36).substr(2, 5); // Random 5 characters
  const timePart = Date.now().toString(36).substr(-5); // Last 5 characters of timestamp
  return randomPart + timePart;
}

app.post('/links/:id/send', checkAuth, async function (req, res, _next) {
  try {
    const link = await Links.findOne({ _id: req.params.id, owner: req.user.email });
    if (!link) {
      res.status(404).send();
      return;
    }
    const names = req.body.viewerName.split(',');
    let url = '';
    for (const name of names) {
      const trackedLink = new TrackedLinks({
        owner: req.user.email,
        linkId: link._id,
        viewerName: name.trim(),
        totalViews: 0,
        totalUniqueViewers: 0,
        url: generateUniqueShortId()
      });
      await trackedLink.save();
      url = trackedLink.url;
    }

    if (names.length == 1) {
      res.json({
        trackedUrl: url,
      })
    }
    else {
      res.json({
        message: "Links sent successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

app.get('/links/:id/visits', checkAuth, async function (req, res, _next) {
  try {
    const link = await Links.findOne({ _id: req.params.id, owner: req.user.email });
    if (!link) {
      res.status(404).send();
      return;
    }
    const trackedLinks = await TrackedLinks.find({ linkId: req.params.id, owner: req.user.email });
    const visits = await Visits.find({ trackedLinkId: { $in: trackedLinks.map(tl => tl._id) } });
    // sort visits by timestamp
    visits.sort((a, b) => b.timestamp - a.timestamp);
    res.json(visits);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

const extractDeviceName = (userAgent) => {
  if (userAgent.includes("Macintosh")) {
    return "Macintosh";
  } else if (userAgent.includes("Windows")) {
    return "Windows PC";
  } else if (userAgent.includes("iPhone")) {
    return "iPhone";
  } else if (userAgent.includes("iPad")) {
    return "iPad";
  } else if (userAgent.includes("Android")) {
    return "Android Device";
  } else if (userAgent.includes("Linux")) {
    return "Linux Device";
  } else {
    return "Unknown Device";
  }
};

// redirect
app.get('/links/:id/redirect', async function (req, res, _next) {
  try {
    const trackedLink = await TrackedLinks.findOne({ url: req.params.id });
    if (!trackedLink) {
      res.status(404).send();
      return;
    }

    const link = await Links.findById(trackedLink.linkId);
    if (!link) {
      res.status(404).send();
      return;
    }

    trackedLink.totalViews += 1;
    link.totalViews += 1;
    if (!req.cookies[`v${req.params.id}`]) {
      trackedLink.totalUniqueViewers += 1;
      link.totalUniqueViewers += 1;
    }

    const visit = new Visits({
      trackedLinkId: trackedLink._id,
      ip: req.ip,
      device: extractDeviceName(req.headers['user-agent']),
      fistVisit: !req.cookies[`v${req.params.id}`],
      timestamp: new Date(),
      viewerName: trackedLink.viewerName,
    });

    await Promise.all([
      trackedLink.save(),
      link.save(),
      visit.save()
    ]);

    res.cookie(`v${req.params.id}`, 'true', { maxAge: 1000 * 60 * 60 * 24 * 365, SameSite: 'None' });
    res.json({
      url: link.url
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

app.listen(8080, () => {
  console.log(
    "Server is running on port 8080. Check the app on http://localhost:8080"
  );
});

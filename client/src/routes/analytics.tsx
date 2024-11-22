import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from '../axios.ts';
import Header from './header.tsx';
import IPMap from './IPMap.tsx';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const [link, setLink] = useState('Loading...');
  const [trackedLinks, setTrackedLinks] = useState([]);
  const [visits, setVisits] = useState([]);
  const [allVisits, setAllVisits] = useState([]);

  useEffect(() => {
    // Fetch the link details
    setLoading(true);
    axios.get(`/links/${id}`).then((response) => {
      setLink(response.data.link.url);
      setTrackedLinks(response.data.trackedLinks);
    });
    axios.get(`/links/${id}/visits`).then((response) => {
      setVisits(response.data);
      setAllVisits(response.data);
      setLoading(false);
    });
  }, []);

  const filterViews = (viewerName: string = '') => {
    if (viewerName)
      setVisits(allVisits.filter((visit: any) => visit.viewerName === viewerName));
    else
      setVisits(allVisits);
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <h1>{link}</h1>
        <h2>Tracked links</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Viewer</th>
              <th>Details</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {trackedLinks.map((trackedLink: any) => (
              <tr>
                <td>{trackedLink.viewerName}</td>
                <td>{trackedLink.totalViews} views ({trackedLink.totalUniqueViewers} unique)</td>
                <td>{window.location.origin}/l/{trackedLink.url}</td>
              </tr>
            ))}
            {trackedLinks.length === 0 && (
              <tr>
                <td colSpan={3}>No tracked links</td>
              </tr>
            )}
          </tbody>
        </table>
        <h2>Visits</h2>
        <p>Filter:&nbsp;
          {trackedLinks.map((trackedLink: any) => (
            <><a href="#" onClick={() => filterViews(trackedLink.viewerName)}>{trackedLink.viewerName}</a>, </>
          ))}
           <a href="#" onClick={() => filterViews()}>All</a></p>
        <IPMap visits={visits} />
        <table className="data-table">
          <thead>
            <tr>
              <th>Viewer</th>
              <th>IP</th>
              <th>When</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit: any) => (
              <tr>
                <td>{visit.viewerName}</td>
                <td>{visit.ip}</td>
                <td>{new Date(visit.timestamp).toLocaleString()}</td>
                <td>{visit.device}</td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td colSpan={4}>No visits yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
      {loading && (
        <div className="loading-overlay show">
            Loading...
        </div>
      )}
    </>
  );
};

export default Analytics;
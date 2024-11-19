import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../axios';
import Modal from 'react-modal';
import Header from './header.tsx';

const List: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [isNewLinkModalOpen, setIsNewLinkModalOpen] = useState(false);
  const [isSendLinkModalOpen, setIsSendLinkModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [viewerName, setViewerName] = useState('');
  const [currentLinkId, setCurrentLinkId] = useState('');

  useEffect(() => {
    // Fetch the user details
    fetchLinks();
  }, []);

  const openNewLinkModal = () => {
    setIsNewLinkModalOpen(true);
  };

  const closeNewLinkModal = () => {
      setIsNewLinkModalOpen(false);
      setNewUrl('');
  };

  const openSendLinkModal = (id: string) => {
    setCurrentLinkId(id);
    setIsSendLinkModalOpen(true);
  }

  const closeSendLinkModal = () => {
    setIsSendLinkModalOpen(false);
    setViewerName('');
  }

  // Function to fetch the secret
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/links/')
      setLinks(response.data);

    } catch (error) {
      console.error(error);
      navigate('/login');
    }
    setLoading(false);
  };

  const createNewItem = async () => {
    if (!newUrl) {
      alert('Please enter the URL');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/links/', {
        url: newUrl
      });
      await fetchLinks();
      closeNewLinkModal();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      setLoading(true);
      try {
        await axios.delete(`/links/${id}`);
        await fetchLinks();
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
  };

  const sendLink = async () => {
    if (!viewerName) {
      alert("Please enter at least a viewer's name");
      return;
    }

    setLoading(true);
    try {
      const resp = await axios.post(`/links/${currentLinkId}/send`, {
        viewerName
      });
      closeSendLinkModal();
      if (resp.data.trackedUrl)
        alert("Link to be sent: " + window.location.origin + '/l/' + resp.data.trackedUrl);
      else
        alert("Links generated. See the list in the Analytics section.")
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const linkDetails = (id: string) => {
    navigate('/' + id);
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <h1>Links List</h1>
          <div className="table-actions">
              <button className="create-button" onClick={openNewLinkModal}>Create New</button>
          </div>
          <table className="data-table">
              <thead>
                  <tr>
                    <th>Link</th>
                    <th>Data</th>
                    <th>Action</th>
                  </tr>
              </thead>
              <tbody>
              {links.map((link:any) => (
                  <tr key={link._id}>
                      <td><a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a></td>
                      <td>
                        {link.totalViews} views ({link.totalUniqueViewers} unique)
                      </td>
                      <td>
                        <button className="delete-button" onClick={() => deleteItem(link._id)}>Delete</button>
                        <button className="default-button" onClick={() => openSendLinkModal(link._id)}>Send Link</button>
                        <button className="default-button" onClick={() => linkDetails(link._id)}>Analytics</button>
                      </td>
                  </tr>
                ))} 
                {links.length === 0 && (
                  (loading) ? (
                    <tr>
                      <td colSpan={3}>Loading...</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={3}>No links</td>
                    </tr>
                  )
                )}
              </tbody>
          </table>
      </main>
      <Modal
          isOpen={isNewLinkModalOpen}
          onRequestClose={closeNewLinkModal}
          contentLabel="Create New Link"
          className="modal"
          overlayClassName="modal-overlay"
      >
          <h2>Enter New Link URL</h2>
          <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://www.example.com"
          />
          <div className="modal-actions">
              <button className="create-button" onClick={createNewItem}>Create</button>
              <button className="cancel-button" onClick={closeNewLinkModal}>Cancel</button>
          </div>
      </Modal>
      <Modal
          isOpen={isSendLinkModalOpen}
          onRequestClose={closeSendLinkModal}
          contentLabel="Send Link"
          className="modal"
          overlayClassName="modal-overlay"
      >
          <h2>Enter Viewer Names</h2>
          <input
              type="text"
              value={viewerName}
              onChange={(e) => setViewerName(e.target.value)}
              placeholder="John, Jane"
          />
          <div className="modal-actions">
              <button className="create-button" onClick={sendLink}>Create</button>
              <button className="cancel-button" onClick={closeSendLinkModal}>Cancel</button>
          </div>
      </Modal>
      {loading && (
        <div className="loading-overlay show">
            Loading...
        </div>
      )}
    </>
  );
};

export default List;
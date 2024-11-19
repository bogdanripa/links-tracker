import React, {useEffect} from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';

const Redirect: React.FC = () => {
  const { id } = useParams();

  useEffect(() => {
    axios.get(`/links/${id}/redirect`).then((response) => {
      window.location = response.data.url;
    });
  }, [id]);

  return (
    <div>Loading...</div>      
  );
};

export default Redirect;
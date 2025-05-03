import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(true); // Assuming user is always true for this example

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        color="inherit"
        onClick={() => navigate('/boards')}
      >
        커뮤니티
      </Button>
      <Button
        color="inherit"
        onClick={() => navigate('/boards?type=NOTICE')}
      >
        공지사항
      </Button>
      {user && (
        // ... existing code ...
      )}
    </Box>
  );
};

export default Header; 

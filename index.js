const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');

const app = express();
const port = process.env.PORT || 3000;

const redisClient = new Redis({
    host: 'redis-10113.c301.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 10113,
    password: 'JwDHHRmHg3UYIjpNftcr8jjm2tXcMelc',
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



app.post('/api/user/stream', async (req, res) => {
    try {
      const { userId } = req.params;
      const { streamName } = req.body;
  
      await redisClient.xgroup('CREATE', streamName, 'myGroup', '$', 'MKSTREAM');

     
      res.status(201).json({ message: 'Stream created successfully' });
    } catch (error) {
      console.error('Error creating user stream:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
app.post('/api/user/:streamName', async (req, res) => {
    try {
      const { userId, streamName } = req.params;
      
      const payload = {
        data: req.body, // Assuming req.body contains the data you want to include
      };
    
    await redisClient.xadd(streamName, '*', 'data', JSON.stringify(payload));
    
      res.status(201).json({ message: 'Data added to the stream' });
    } catch (error) {
      console.error('Error adding data to user stream:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

app.get('/api/user/:streamName', async (req, res) => {
    try {
      const { userId, streamName } = req.params;
      
      const streamData = await redisClient.xrange(streamName, '-', '+');
      
      const extractedData = streamData.map(([messageId, message]) => JSON.parse(message[1]))
        
      res.status(200).json(extractedData);
    } catch (error) {
      console.error('Error fetching data from user stream:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('api/notify', async (req,res) => {
      
    const { fcm_token, studentName } = req.body

    const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('./path-to-your-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// The FCM token of the target device
const targetDeviceToken = 'TARGET_DEVICE_FCM_TOKEN';

const message = {
  notification: {
    title: 'Notification Title',
    body: 'Notification Body',
  },
  token: targetDeviceToken,
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Notification sent successfully:', response);
    // Handle success
  })
  .catch((error) => {
    console.error('Error sending notification:', error);
    // Handle error
  });



    const payload = {
      data: req.body, 
    };

    await redisClient.xadd(streamName, '*', 'data', JSON.stringify(payload))

  })

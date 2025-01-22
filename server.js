const express = require("express");
const cors = require("cors");
const { Server } = require('socket.io');
const fs = require("fs");
const http = require("http");
const dotenv = require("dotenv");
const { Readable } = require("stream");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const path = require("path");

const app = express();
app.use(cors())
dotenv.config();
const server = http.createServer(app);




// // Set axios default headers
// axios.defaults.headers.common["origin"] = 'https://opal-express-gc8f.onrender.com';
// axios.defaults.headers.common["Content-Type"] = "application/json";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Socket.IO configuration with better error handling
const io = new Server(server, {
  cors: {
      origin: '*',
      methods: ["GET", "POST"],
  },
})
// Ensure temp_upload directory exists
const uploadDir = path.join(__dirname, 'temp_upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Store chunks per socket connection
const socketChunks = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socketChunks.set(socket.id, []);

  socket.emit("connected");

  socket.on("video-chunks", async (data) => {
    try {
      console.log("🟢 Receiving video chunk for:", data.filename);
      
      const chunks = socketChunks.get(socket.id);
      chunks.push(data.chunks);
      
      const filePath = path.join(uploadDir, data.filename);
      const writeStream = fs.createWriteStream(filePath);
      
      const videoBlob = new Blob(chunks, {
        type: "video/webm; codecs=vp9",
      });
      
      const buffer = Buffer.from(await videoBlob.arrayBuffer());
      const readStream = Readable.from(buffer);
      
      readStream.pipe(writeStream);
      
      writeStream.on("finish", () => {
        console.log("🟢 Chunk saved for:", data.filename);
      });

      writeStream.on("error", (error) => {
        console.error("🔴 Error saving chunk:", error);
        socket.emit("upload-error", { message: "Failed to save video chunk" });
      });
    } catch (error) {
      console.error("🔴 Error processing video chunk:", error);
      socket.emit("upload-error", { message: "Failed to process video chunk" });
    }
  });

  socket.on("process-video", async (data) => {
    try {
      console.log("🟢 Processing video:", data.filename);
      socketChunks.set(socket.id, []); // Clear chunks

      const filePath = path.join(uploadDir, data.filename);
      
      // Verify file exists
      console.log("came on File Check")
      if (!fs.existsSync(filePath)) {
        throw new Error("Video file not found");
      }
      
      // Start processing
      console.log("came on processing")
      const processing = await axios.post(
        `${process.env.NEXT_API_HOST}recording/${data.userId}/processing`,
        { filename: data.filename }
      );
      console.log("Processing status  Came")
      if (processing.data.status !== 200) {
        throw new Error("Failed to create processing file");
      }
      console.log("Cloudinary Came")
      // Upload to Cloudinary
      console.log("🟢 Cloudinary Config:", {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key,
      });
      console.log("Came for the upload")
      
      const cloudinaryUpload = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "opal",
          public_id: data.filename,
        },
        async (error, result) => {
          try {
            if (error) {
              throw error;
            }

            console.log("🟢 Video uploaded to Cloudinary:", result.secure_url);
            
            // Complete processing
            const stopProcessing = await axios.post(
              `${process.env.NEXT_API_HOST}recording/${data.userId}/complete`,
              { filename: data.filename }
            );

            if (stopProcessing.data.status !== 200) {
              throw new Error("Failed to complete processing");
            }

            // Clean up
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error("🔴 Error deleting file:", err);
              } else {
                console.log("🟢 Deleted file:", data.filename);
              }
            });

          } catch (error) {
            console.error("🔴 Error in Cloudinary upload callback:", error);
          }
        }
      );

      fs.createReadStream(filePath).pipe(cloudinaryUpload);

    } catch (error) {
      console.error("🔴 Error processing video:", error);
    }
  });


  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
    socketChunks.delete(socket.id); // Clean up chunks
  });
});

// Error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('🔴 Unhandled Rejection:', error);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🟢 Server listening on port ${PORT}`);
});



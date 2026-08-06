require("dotenv").config();

const app = require("./app");
const cors = require("cors");
const PORT = process.env.PORT;
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend.vercel.app",
    ],
    credentials: true,
  })
);
app.listen(PORT, () => {

    console.log(`Server running on ${PORT}`);

});
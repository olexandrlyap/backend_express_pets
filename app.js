require('dotenv').config();
require('express-async-errors');
// express

const express = require('express');
const app = express();
// rest of the packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// database
const connectDB = require('./db/connect');

//  routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const petRouter = require('./routes/petRoutes')
const tagRouter = require('./routes/tagRoutes')
const profileRouter = require('./routes/profileRoutes')
const favoritePetRouter = require('./routes/favoritePetRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const petCategoriesRouter = require('./routes/petCategoriesRoutes')


// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');



const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3000/zvirata'], 
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(express.json());


app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/pets', petRouter)
app.use('/api/v1/tags', tagRouter)
app.use('/api/v1/profiles', profileRouter)
app.use('/api/v1/favorite-pets', favoritePetRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/pet-categories', petCategoriesRouter)


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

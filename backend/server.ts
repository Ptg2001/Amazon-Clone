import dotenv from 'dotenv'
import { app, connectToDatabase } from './app'

dotenv.config()

const PORT = process.env.PORT || 5000

connectToDatabase()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected successfully')
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`)
      // eslint-disable-next-line no-console
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })



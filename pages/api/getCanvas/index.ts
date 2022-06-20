import { NextApiRequest, NextApiResponse } from 'next'
import DB from '@/data/mongo'
const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const db = new DB()
  try {
    let canvas = await db.getCanvas()
    return res.status(200).json(canvas)
  } catch (err) {
    res.status(500).json(err)
  }
}

export default handler
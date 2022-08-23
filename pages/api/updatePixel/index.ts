import { NextApiRequest, NextApiResponse } from 'next'
import DB from '@/data/mongo'
import conf from "../../../config/config"
type Query = {
    x: number,
    y: number
}

type PixelColor = {
    r: number,
    g: number,
    b: number
}


const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const {x, y, r, g, b} = req.query

  const xCoord = Number(x)
  const yCoord = Number(y)
  const rColor = Number(r)
  const gColor = Number(g)
  const bColor = Number(b)

  if(
    xCoord < 0 || 
    yCoord < 0 ||
    rColor < 0 || 
    gColor < 0 || 
    bColor < 0 || 
    xCoord > conf.canvasWidth / conf.pixelSize || 
    yCoord > conf.canvasHeight / conf.pixelSize || 
    rColor > 255 || 
    gColor > 255 || 
    bColor > 255
    ) {
    return res.status(400).json({
      error: 'Bad Request'
    })
  }


  const color: PixelColor = {
    r: rColor,
    g: gColor,
    b: bColor
  }

  const query: Query = {
    x: xCoord,
    y: yCoord
  }

  const db = new DB()
  try {
    let data = db.updatePixel(query, color)
    res.status(200).json({
      message: "Pixel updated",
    })
  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error'
    })
  }
}

export default handler

export const config = {
  api: {
    responseLimit: false,
  },
}
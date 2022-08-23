import { server } from 'config/server'
import type { NextPage } from 'next'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import conf from '../config/config'

type Position = {
    x: number,
    y: number
}

type Color = {
  color: string,
}

type Event = {
  target: any
  clientX: number
  clientY: number
}

type canvasData = { 
    x: number,
    y: number,
    color: {
      r: number,
      g: number,
      b: number,
    }
}

function hexToRgb(color: any) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.color);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {};
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

const colors = [
  "#6d011b",
  "#bd0038",
  "#ff4500",
  "#ffa800",
  "#ffd636",
  "#fff8b9",
  "#00a468",
  "#00cc77", 
  "#7fed56", 
  "#00756f", 
  "#009eaa", 
  "#00ccc0", 
  "#2350a3", 
  "#368fe9", 
  "#51e9f4", 
  "#4a3ac1", 
  "#6b5cff", 
  "#93b3fe", 
  "#811e9f", 
  "#b34ac0", 
  "#e5abff", 
  "#de107f", 
  "#ff3881", 
  "#ff98a9", 
  "#6d482e", 
  "#9c6927", 
  "#ffb470", 
  "#000000", 
  "#515352", 
  "#898d90", 
  "#d3d7da", 
  "#ffffff"
]

const oldColor = [
  "#FFFFFF",
  "#E4E4E4",
  "#888888",
  "#222222",
  "#FFA7D1",
  "#E50000",
  "#E59500",
  "#A06A42",
  "#E5D900",
  "#94E044",
  "#02BE01",
  "#00D3DD",
  "#0083C7",
  "#0000EA",
  "#CF6EE4",
  "#820080"
]

const Home: NextPage = ({canvasData}: any) => {
  const [pos, setPosition] = useState<Position>({x: 0, y: 0})
  const [selectedColor, setColor] = useState<Color>({color: '#FFFFFF'})

  const canvas: any = useRef()
  useEffect(() => {
    const ctx = canvas.current.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    canvasData.forEach((data: canvasData) => {
      const {x, y, color} = data
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
      ctx.fillRect(x * conf.pixelSize, y * conf.pixelSize, conf.pixelSize, conf.pixelSize)
    })
  }, [])

  
  const [socket, setSocket] = useState<any>()
  
  useEffect(() => {
    fetch('/api/socketio').finally(() => {
      const socket = io()
      socket.on('connect', () => {
        console.log('connect')
        setSocket(socket)
      })
      
      socket.on('pixelUpdateAck', data => {
        const ctx = canvas.current.getContext("2d")
        ctx.fillStyle = `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`
        ctx.fillRect(data.x * conf.pixelSize, data.y * conf.pixelSize, conf.pixelSize, conf.pixelSize)
      })
      
      socket.on('disconnect', (reason) => {
        console.log('Something happened, you are disconnected')
        if (reason === "io server disconnect") {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket.connect();
        }
      })
    })
  }, [])
  
  function getMousePosition( event: Event) {
      const rect = event.target.getBoundingClientRect()
      const x = Math.floor((event.clientX - rect.left) / conf.pixelSize)
      const y = Math.floor((event.clientY - rect.top) / conf.pixelSize)
      setPosition({x, y})
  }
  
  function registerClick() {
    const ctx = canvas.current.getContext("2d")
    const rgb = hexToRgb(selectedColor)
      ctx.fillStyle = `rgb(${rgb.r}, ${rgb?.g}, ${rgb?.b})`
      ctx.fillRect(pos.x * conf.pixelSize, pos.y * conf.pixelSize, conf.pixelSize, conf.pixelSize);
      fetch(`/api/updatePixel?x=${pos.x}&y=${pos.y}&r=${rgb?.r}&g=${rgb?.g}&b=${rgb?.b}`)
      socket.emit("pixelUpdateRequest", {
        x: pos.x,
        y: pos.y, 
        color: {
          r: rgb.r, 
          g: rgb.g,
          b: rgb.b 
        }
      })
  }

  return (
    <div className=''>
        <div className='m-3 right-0 fixed z-20'>
        <p className='text-[1.4rem] mb-4 text-green-500 text-center'>Legacy colors:</p>
          <div className="flex h-fit flex-wrap w-52">
              {oldColor.map((color, index) => {
                console.log(color == selectedColor.color) 
                return (
                  <div key={index} 
                    onClick={() => {
                      setColor({color})
                    }}
                    style={{
                      backgroundColor: color,
                    }}
                    className={classNames(
                      color === selectedColor.color ? 'border-[3px] border-white scale-110' : 'hover:scale-[90%]',
                      "w-10 h-10 rounded-full m-1 md:mb-0  my-1 cursor-pointer group"
                    )}
                    >
                  </div>
                )
              })}
            </div>
        </div>
        <div className='m-4 fixed z-20'>
          <p className='text-[1.4rem] mb-4 text-green-500 text-center'>Colors:</p>
          <div className="flex h-fit flex-wrap w-52">
              {colors.map((color, index) => {
                return (
                  <div key={index} 
                    onClick={() => {
                      setColor({color})
                    }}
                    style={{
                      backgroundColor: color,
                    }}
                    className={classNames(
                      color === selectedColor.color ? 'border-[3px] border-white scale-110' : 'hover:scale-[90%]',
                      "w-10 h-10 rounded-full m-1 md:mb-0  my-1 cursor-pointer group"
                    )}
                    >
                  </div>
                )
              })}
            </div>
            <p className="noselect text-gray-200 text-[2rem] px-2 py-1 rounded-full mt-5">
              X: {Math.floor(pos.x)} Y: {Math.floor(pos.y)}
            </p>
        </div>
      <div className="flex items-center justify-center h-20">
        </div>
      <div className="h-[100%] w-[100%] flex flex-col items-center justify-center">
        <div className=''>
          <canvas 
            onPointerDown={registerClick} 
            onMouseMove={(e) => getMousePosition(e)} 
            width={conf.canvasWidth} 
            height={conf.canvasHeight} 
            ref={canvas}>
          </canvas>
        </div>
      </div>
    </div>
  )
}

export default Home

// serverside get from /api/getCanvas
export async function getServerSideProps() {
  const res = await fetch(`${server}/api/getCanvas`)
  const canvasData = await res.json()
  return {
    props: {
      canvasData
    }
  }
}

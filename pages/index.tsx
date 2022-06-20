import { server } from 'config/server'
import type { NextPage } from 'next'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

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

const pixelSize = 5

const Home: NextPage = ({canvasData}: any) => {
  const [pos, setPosition] = useState<Position>({x: 0, y: 0})
  const [color, setColor] = useState<Color>({color: '#FFFFFF'})
  const [toggledColor, setToggledColor] = useState<any>(colors[0])

  const canvas: any = useRef()
  useEffect(() => {
    const ctx = canvas.current.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    canvasData.forEach((data: canvasData) => {
      const {x, y, color} = data
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    })
  }, [])

  function getMousePosition( event: Event) {
    const rect = event.target.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / pixelSize)
    const y = Math.floor((event.clientY - rect.top) / pixelSize)
    setPosition({x, y})
  }

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
        ctx.fillRect(data.x * pixelSize, data.y * pixelSize, pixelSize, pixelSize)
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

  function registerClick() {
    const ctx = canvas.current.getContext("2d")
    const rgb = hexToRgb(color)
    ctx.fillStyle = `rgb(${rgb.r}, ${rgb?.g}, ${rgb?.b})`
    ctx.fillRect(pos.x * pixelSize, pos.y * pixelSize, pixelSize, pixelSize);
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

  const cursorRef: any = useRef(null)

  useEffect(() => {
    if (cursorRef.current == null || cursorRef == null) return;
    document.addEventListener('mousemove', e => {
      if (cursorRef.current == null) return;
      cursorRef.current.setAttribute("style", "top: " + (e.pageY) + "px; left: " + (e.pageX) + "px;")
    })
    document.addEventListener('mousedown mouseup', e => {
      console.log(e.type)
    })
  }, [])
  
  return (
    <div className=''>
      <div className="flex items-center justify-center h-20">
          <p className='text-[2rem] text-green-600'>Draw</p>
        </div>
      <div className="h-[100%] w-[100%] flex md:flex-row flex-col items-center justify-center">


        {/* Sidebar with Colorselect and pos */}
        <div className="md:w-24 flex flex-row md:flex-col">
            {colors.map((color, index) => {
              return (
                <div key={index} 
                  onClick={() => {
                    setColor({color})
                    setToggledColor(color)
                  }}
                  className={classNames(
                    color === toggledColor ? 'border-4 border-red-600 scale-125' : 'scale-100',
                    index == 0 && "bg-[#FFFFFF]",
                    index == 1 && "bg-[#E4E4E4]",
                    index == 2 && "bg-[#888888]",
                    index == 3 && "bg-[#222222]",
                    index == 4 && "bg-[#FFA7D1]",
                    index == 5 && "bg-[#E50000]",
                    index == 6 && "bg-[#E59500]",
                    index == 7 && "bg-[#A06A42]",
                    index == 8 && "bg-[#E5D900]",
                    index == 9 && "bg-[#94E044]",
                    index == 10 && "bg-[#02BE01]",
                    index == 11 && "bg-[#00D3DD]",
                    index == 12 && "bg-[#0083C7]",
                    index == 13 && "bg-[#0000EA]",
                    index == 14 && "bg-[#CF6EE4]",
                    index == 15 && "bg-[#820080]",
                    "w-7 h-7 rounded-full md:ml-8 md:mb-0 mb-3 ml-1 my-1 cursor-pointer group hover:translate-x-2"
                  )}>
                </div>
              )
            })}
        </div>
        {/* Canvas */}
        <div className='group'>
          <canvas 
            onClick={registerClick} 
            onMouseMove={(e) => getMousePosition(e)} 
            width={1280} 
            height={720} 
            ref={canvas}>
          </canvas>

          <p ref={cursorRef} className="group-hover:block hidden text-gray-700 bg-[rgba(128,128,128,0.5)] px-2 py-1 rounded-full text-sm absolute mt-5">
            X: {Math.floor(pos.x)} Y: {Math.floor(pos.y)}
          </p>
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

import React,{useEffect, useRef, useState} from 'react'
import './App.css'
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay'
import Information from './components/Information'
import Transcribing from './components/Transcribing'

function App() {

  const [file,setFile] = useState(null)
  const [audioStream,setAudioStream] = useState(null)
  const [output,setOutput] = useState(null)
  const [loading,setLoading] = useState(false)
  const [finished,setFinished] = useState(false)
  const [downloading,setDownloading] = useState(false)

  const isAudioAvailable = file || audioStream

  function handleAudioReset(){
    setFile(null)
    setAudioStream(null)
  }

  const worker = useRef(null)

  useEffect(()=>{
    if(worker.current){
      worker.current = new Worker(new URL('./utills/whisper.worker.js',import.meta.url),
      {type:'module'})
    }

    const onMessageRecieved = async (e) => {
      switch(e.data.type){
        case 'DOWNLOADING':
          setDownloading(true)
          console.log('Downloading')
          break
        case 'LOADING':
          setLoading(true)
          console.log('Loading')
          break
        case 'RESULT':
          setOutput(e.data.results)
          break
        case 'INFERENCE_DONE':
          setFinished(true)
          console.log('Done')
          break 
        }
      
      worker.current.addEventListener('message',onMessageRecieved)

      return ()=>{
        worker.current.removeEventListener('message',onMessageRecieved)
      }
    }
  },[])

  async function readAudioFrom(file){
    const sampling_rate = 16000
    const audioCTX = new AudioContext({sampleRate:sampling_rate})
    const response = await file.arrayBuffer()
    const decoded = await audioCTX.decodeAudioData(response)
    const audio = decoded.getChannelData(0)
    return audio
  }

  async function handleFormSubmission(){
    if(!file && !audioStream){
      return
    }

    let audio = await readAudioFrom(file?file:audioStream)
    const model_name = 'openai/whisper-tiny.en'

    worker.current.postMessage({
      type:MessageTyped.INFERENCE_REQUEST,
      audio,
      model_name
    })
  }


  return (
    <div className='flex flex-col max-w-[1000px] mx-auto w-full'>
      <section className='min-h-screen flex flex-col'>
        <Header/>
        {output ? (<Information/>): loading ? (<Transcribing/>):
        isAudioAvailable ? (<FileDisplay handleAudioReset={handleAudioReset} file={file} audioStream={audioStream} />):
        (<HomePage setFile={setFile} setAudioStream={setAudioStream}/>)
        }
      </section>
    </div>
  )
}

export default App

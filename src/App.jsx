import React,{useState} from 'react'
import './App.css'
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay'

function App() {

  const [file,setFile] = useState(null)
  const [audioStream,setAudioStream] = useState(null)

  const isAudioAvailable = file || audioStream

  function handleAudioReset(){
    setFile(null)
    setAudioStream(null)
  }

  return (
    <div className='flex flex-col max-w-[1000px] mx-auto w-full'>
      <section className='min-h-screen flex flex-col'>
        <Header/>
        {isAudioAvailable ? (<FileDisplay handleAudioReset={handleAudioReset} file={file} audioStream={audioStream} />):(<HomePage setFile={setFile} setAudioStream={setAudioStream}/>)}
      </section>
    </div>
  )
}

export default App

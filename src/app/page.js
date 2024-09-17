'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import dynamic from 'next/dynamic'

const VideoPlayer = dynamic(() => import('@/VideoPlayer'), {
  ssr: false,
})

export default function VideoPlayerTester() {
  const [videoUrl, setVideoUrl] = useState('')

  const handleUrlChange = (event) => {
    setVideoUrl(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={videoUrl}
            onChange={handleUrlChange}
            placeholder="Enter video URL"
            className="flex-grow"
          />
          <Button type="submit">Load Video</Button>
        </div>
      </form>
      <VideoPlayer url={videoUrl} />
    </div>
  )
}
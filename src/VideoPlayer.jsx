'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, PictureInPicture } from 'lucide-react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ReactPlayer from 'react-player'

export default function VideoPlayer({ url }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const settingsRef = useRef(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleTouchStart = () => {
      setShowControls(true)
      clearTimeout(controlsTimeoutRef.current)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('touchstart', handleTouchStart)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('touchstart', handleTouchStart)
      }
      clearTimeout(controlsTimeoutRef.current)
    }
  }, [isPlaying])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgress = (state) => {
    setProgress(state.played * 100)
  }

  const handleDuration = (duration) => {
    setDuration(duration)
  }

  const handleVolumeChange = (newValue) => {
    const newVolume = newValue[0] / 100
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleSeek = (newValue) => {
    playerRef.current?.seekTo(newValue[0] / 100)
  }

  const skip = (amount) => {
    playerRef.current?.seekTo(playerRef.current.getCurrentTime() + amount)
  }

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate)
    setIsSettingsOpen(false)
  }

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await playerRef.current?.getInternalPlayer().requestPictureInPicture()
      }
    } catch (error) {
      console.error('Failed to enter/exit Picture-in-Picture mode:', error)
    }
  }

  const ControlButton = ({ icon, onClick, tooltip, className = "" }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClick} 
            className={`text-white hover:text-primary hover:bg-white/20 ${className}`}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const SettingsDropdown = ({ isOpen, children }) => {
    if (!isOpen) return null

    return (
      <div 
        ref={settingsRef}
        className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-md overflow-hidden settings-dropdown w-48 max-h-[40vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    )
  }

  const SettingsItem = ({ onClick, children, isActive }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm ${
        isActive ? 'bg-primary text-white' : 'text-white hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div ref={containerRef} className="relative w-full bg-black rounded-lg overflow-hidden shadow-xl">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="auto"
        playing={isPlaying}
        volume={volume}
        muted={isMuted}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onReady={() => {
          if (isPlaying) {
            playerRef.current?.seekTo(0)
          }
        }}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-white hover:text-primary hover:bg-white/20 w-20 h-20"
          >
            <Play className="h-16 w-16" />
          </Button>
        </div>
      )}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 sm:p-4 transition-opacity duration-300">
          <div className="flex items-center mb-2">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md [&>.relative>.absolute]:bg-primary"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <ControlButton
                icon={isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={togglePlay}
                tooltip={isPlaying ? "Pause" : "Play"}
              />
              <ControlButton
                icon={<SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={() => skip(-10)}
                tooltip="Rewind 10s"
              />
              <ControlButton
                icon={<SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={() => skip(10)}
                tooltip="Forward 10s"
              />
              <div className="relative">
                <ControlButton
                  icon={isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  onClick={() => {
                    toggleMute()
                    setShowVolumeSlider(!showVolumeSlider)
                  }}
                  tooltip={isMuted ? "Unmute" : "Mute"}
                />
                {showVolumeSlider && (
                  <div className="absolute bottom-full left-0 mb-2 bg-black/80 p-2 rounded-md">
                    <Slider
                      orientation="vertical"
                      value={[isMuted ? 0 : volume * 100]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="h-24 [&_[role=slider]]:bg-white [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md [&>.relative>.absolute]:bg-primary"
                    />
                  </div>
                )}
              </div>
              <span className="text-white text-xs sm:text-sm">
                {formatTime(playerRef.current?.getCurrentTime() || 0)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
              <ControlButton
                icon={<PictureInPicture className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={togglePictureInPicture}
                tooltip="Picture-in-Picture"
              />
              <div className="relative">
                <ControlButton
                  icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  tooltip="Settings"
                />
                <SettingsDropdown isOpen={isSettingsOpen}>
                  <div>
                    <SettingsItem onClick={() => handlePlaybackRateChange(0.5)} isActive={playbackRate === 0.5}>
                      0.5x {playbackRate === 0.5 && '✓'}
                    </SettingsItem>
                    <SettingsItem onClick={() => handlePlaybackRateChange(1)} isActive={playbackRate === 1}>
                      1x {playbackRate === 1 && '✓'}
                    </SettingsItem>
                    <SettingsItem onClick={() => handlePlaybackRateChange(1.5)} isActive={playbackRate === 1.5}>
                      1.5x {playbackRate === 1.5 && '✓'}
                    </SettingsItem>
                    <SettingsItem onClick={() => handlePlaybackRateChange(2)} isActive={playbackRate === 2}>
                      2x {playbackRate === 2 && '✓'}
                    </SettingsItem>
                  </div>
                </SettingsDropdown>
              </div>
              <ControlButton
                icon={isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={toggleFullscreen}
                tooltip={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
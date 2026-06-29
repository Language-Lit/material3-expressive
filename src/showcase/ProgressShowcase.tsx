import React from 'react'
import { CircularProgress } from '../components/feedback/CircularProgress'
import { LinearProgress } from '../components/feedback/LinearProgress'

export const Progress = () => (
  <div className='p-24dp space-y-32dp'>
    <h1 className='text-display-medium mb-16dp'>Progress Component Examples</h1>
    
    <section>
      <h2 className='text-headline-small mb-16dp'>Circular Progress</h2>
      <div className='grid grid-cols-3 gap-16dp'>
        <div>
          <h3 className='text-title-medium mb-8dp'>Default</h3>
          <CircularProgress value={75} />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Small</h3>
          <CircularProgress value={50} />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Large</h3>
          <CircularProgress value={25} />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Secondary</h3>
          <CircularProgress value={60} />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Indeterminate</h3>
          <CircularProgress indeterminate />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Custom Color</h3>
          <CircularProgress value={80} className='text-[var(--md-sys-color-tertiary)]' />
        </div>
      </div>
    </section>
    
    <section>
      <h2 className='text-headline-small mb-16dp'>Linear Progress</h2>
      <div className='space-y-16dp'>
        <div>
          <h3 className='text-title-medium mb-8dp'>Default</h3>
          <LinearProgress value={75} className='w-full' />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Small</h3>
          <LinearProgress value={50} className='w-full' />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Large</h3>
          <LinearProgress value={25} size='lg' className='w-full' />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Secondary</h3>
          <LinearProgress value={60} variant='secondary' className='w-full' />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Indeterminate</h3>
          <LinearProgress indeterminate className='w-full' />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>With Buffer</h3>
          <LinearProgress value={30} buffer={60} className='w-full' />
        </div>
        <div>
          <h3 className='text-title-medium mb-8dp'>Custom Color</h3>
          <LinearProgress 
            value={80} 
            className='w-full [&>div]:bg-[var(--md-sys-color-tertiary)]' 
          />
        </div>
      </div>
    </section>

    <section>
      <h2 className='text-headline-small mb-16dp'>Interactive Example</h2>
      <InteractiveProgress />
    </section>
  </div>
)

function InteractiveProgress() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0
        }
        const diff = Math.random() * 10
        return Math.min(oldProgress + diff, 100)
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className='space-y-16dp'>
      <CircularProgress value={progress} />
      <LinearProgress value={progress} className='w-full' />
    </div>
  )
}

// Also export as ProgressShowcase for consistency
export const ProgressShowcase = Progress

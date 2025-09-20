import Input from '@/app/components/ui/input/Input'
import React from 'react'

const page = () => {
  return (
    <div className='p-2 size-full'>
      <div className='rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2'>
        <div className='bg-background p-5 px-8 text-2xl font-mono font- text-inactive rounded-lg w-fit' >MO - 000001</div>
        <Input placeholder='Product' className='py-4' />
        <Input placeholder='Quantity' type='number' className='py-4' />
      </div>
    </div>
  )
}

export default page
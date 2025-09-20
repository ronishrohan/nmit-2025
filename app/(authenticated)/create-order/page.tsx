import Input from '@/app/components/ui/input/Input'
import React from 'react'

const page = () => {
  return (
    <div className='p-2 size-full'>
      <div className='rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2'>
        <div className='bg-background p-5 px-8 text-2xl font-mono font- text-inactive rounded-lg w-fit' >MO - 000001</div>
        <div className='flex gap-2 w-full'>
          <Input placeholder='Product' className='' />
          <Input placeholder='Quantity' type='number' />
        </div>
        <Input placeholder='Bill of Material' type='number' />
      </div>
    </div>
  )
}

export default page
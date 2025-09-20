"use client"
import { moApi } from '@/app/api/moApi'
import { moPresetsApi } from '@/app/api/moPresetsApi'
import { productApi } from '@/app/api/productApi'
import Button from '@/app/components/ui/button/Button'
import { Dropdown } from '@/app/components/ui/dropdown/Dropdown'
import Input from '@/app/components/ui/input/Input'
import { useUserStore } from '@/app/store'
import React, { useEffect, useState } from 'react'

const page = () => {
  const [presets, setPresets] = useState(null)
  const [productData, setProductData] = useState(null)
  const {userId} = useUserStore()
  const [order, setOrder] = useState<number | null>(null)
  useEffect(() => {
    moApi.create({userId: userId}).then(p => {
      console.log(p)
      setOrder(p.data)
    })
    moPresetsApi.getAll().then(p => {
      console.log("presets",p.data)
      setPresets(p.data)
    })
  }, [])

  
  const [product, setProduct] = useState<string | null >(null)
  return (
    <div className='p-2 size-full'>
      <div className='flex gap-2 h-[66px] mb-2' >
        <Button className='text-xl px-6 '>Confirm</Button>
        <Button variant='secondary' className='text-xl px-6 '>Back</Button>
      </div>
      <div className='rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2'>
        <div className='bg-background p-5 px-8 text-2xl font-mono font-medium text-inactive rounded-lg w-fit'>MO {order?.id ?? "Loading"}</div>
        
        <div className='flex gap-2 w-full'>
          {presets && <><Dropdown width={250} currentValue={product ?? "None"} setValue={(product: string) => {
            setProduct(product)

          }} values={presets.map(p => p.name)} /></>}
          <Input placeholder='Quantity' type='number' defaultValue='2' />
        </div>
        
        <div className='flex gap-2 w-full'>
          <Input placeholder='Schedule Start Date' type='date' />
          <Input placeholder='Deadline' type='date' />
        </div>
        
        <div className='flex gap-2 w-full'>
          <Input placeholder='Status' defaultValue='draft' />
          <Input placeholder='Product ID' type='number' />
        </div>
        
        <div className='flex gap-2 w-full'>
          <Input placeholder='User ID' type='number' defaultValue='9' />
          <Input placeholder='Assigned To ID' type='number' defaultValue='10' />
        </div>
        
        <Input placeholder='Bill of Material' type='number' />
        
        <div className='flex gap-2 w-full'>
          <Input placeholder='Components' />
          <Input placeholder='Work Orders' />
        </div>
      </div>
    </div>
  )
}

export default page
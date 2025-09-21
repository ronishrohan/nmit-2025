"use client"
import { moApi } from '@/app/api/moApi'
import { moPresetsApi } from '@/app/api/moPresetsApi'
import { productApi } from '@/app/api/productApi'
import Button from '@/app/components/ui/button/Button'
import { Dropdown } from '@/app/components/ui/dropdown/Dropdown'
import Input from '@/app/components/ui/input/Input'
import { useUserStore } from '@/app/store'
import React, { useEffect, useState } from 'react'

// TypeScript interfaces
interface Component {
  id: number
  name: string
  unit: string
  description: string
  price?: number
}

interface ComponentProduct {
  id: number
  name: string
  description: string
  unit: string
  price?: number
  cost?: number
  createdAt: string
}

interface BOMItem {
  id: number
  productId: number
  operation: string
  opDurationMins: number
  componentId: number
  quantity: number
  createdAt: string
  component: Component
}

interface Stock {
  id: number
  productId: number
  quantity: number
  updatedAt: string
}

interface Product {
  id: number
  name: string
  description: string
  unit: string
  createdAt: string
  bom: BOMItem[]
  stock: Stock
  basePrice?: number // Optional base price for the product
  laborCostPerMinute?: number // Optional labor cost per minute
}

interface CreatedBy {
  id: number
  name: string
  email: string
}

interface Preset {
  id: number
  name: string
  description: string
  quantity: number
  createdAt: string
  updatedAt: string
  productId: number
  createdById: number
  createdBy: CreatedBy
  product: Product
}

interface Order {
  id: number
}

type TabType = 'components' | 'workorders'

const page: React.FC = () => {
  const [presets, setPresets] = useState<Preset[] | null>(null)
  const [productData, setProductData] = useState<Product | null>(null)
  const [selectedPresetData, setSelectedPresetData] = useState<Preset | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('components')
  const { userId } = useUserStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [quantity, setQuantity] = useState<number>(2)
  const [product, setProduct] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [componentPrices, setComponentPrices] = useState<Record<number, ComponentProduct>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [scheduleStartDate, setScheduleStartDate] = useState<string>('')
  const [deadline, setDeadline] = useState<string>('')
  const [assignedToId, setAssignedToId] = useState<number>(10)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderResponse = await moApi.create({ userId: userId })
        console.log(orderResponse)
        setOrder(orderResponse.data)

        const presetsResponse = await moPresetsApi.getAll()
        console.log("presets", presetsResponse.data)
        setPresets(presetsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [userId])

  const handlePresetSelection = async (presetName: string): Promise<void> => {
    if (!presets) return
    
    const selectedPreset = presets.find((p: Preset) => p.name === presetName)
    if (selectedPreset) {
      setSelectedPresetData(selectedPreset)
      
      // Fetch component prices
      const componentPricesMap = await fetchComponentPrices(selectedPreset.product.bom)
      setComponentPrices(componentPricesMap)
      
      // Calculate and set total price
      const calculatedPrice = calculateTotalPrice(
        selectedPreset.product.bom, 
        quantity, 
        componentPricesMap
      )
      setTotalPrice(calculatedPrice)
    }
  }

  const fetchComponentPrices = async (bom: BOMItem[]): Promise<Record<number, ComponentProduct>> => {
    const componentPricesMap: Record<number, ComponentProduct> = {}
    
    try {
      // Fetch all component details in parallel
      const componentPromises = bom.map(async (bomItem) => {
        try {
          const response = await productApi.getById(bomItem.componentId)
          return {
            componentId: bomItem.componentId,
            data: response.data
          }
        } catch (error) {
          console.error(`Error fetching component ${bomItem.componentId}:`, error)
          return {
            componentId: bomItem.componentId,
            data: null
          }
        }
      })

      const componentResults = await Promise.all(componentPromises)
      
      componentResults.forEach(result => {
        if (result.data) {
          componentPricesMap[result.componentId] = result.data
        }
      })
      
      return componentPricesMap
    } catch (error) {
      console.error('Error fetching component prices:', error)
      return componentPricesMap
    }
  }

  const calculateTotalPrice = (bom: BOMItem[], quantity: number, componentPricesMap: Record<number, ComponentProduct>): number => {
    // Calculate material costs using actual component prices
    const materialCost = bom.reduce((total: number, item: BOMItem) => {
      const componentData = componentPricesMap[item.componentId]
      const componentPrice = componentData?.price || componentData?.cost || 0
      return total + (componentPrice * item.quantity * quantity)
    }, 0)

    // Calculate labor costs (assuming $0.50 per minute)
    const totalLaborMinutes = bom.reduce((total: number, item: BOMItem) => {
      return total + (item.opDurationMins * quantity)
    }, 0)
    const laborCostPerMinute = 0.5 // $0.50 per minute
    const laborCost = totalLaborMinutes * laborCostPerMinute

    return materialCost + laborCost
  }

  const calculateTotalDuration = (bom: BOMItem[]): number => {
    return bom.reduce((total: number, item: BOMItem) => total + item.opDurationMins, 0)
  }

  const calculateTotalComponents = (bom: BOMItem[]): number => {
    return bom.reduce((total: number, item: BOMItem) => total + (item.quantity * quantity), 0)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value) || 1
    setQuantity(value)
    
    // Recalculate total price when quantity changes
    if (selectedPresetData && Object.keys(componentPrices).length > 0) {
      const calculatedPrice = calculateTotalPrice(
        selectedPresetData.product.bom, 
        value, 
        componentPrices
      )
      setTotalPrice(calculatedPrice)
    }
  }

  const handleTabClick = (tab: TabType): void => {
    setActiveTab(tab)
  }

  const handleSaveDraft = async (): Promise<void> => {
    if (!selectedPresetData || !order) {
      // alert('Please select a product and ensure order is created')
      return
    }

    setIsLoading(true)
    
    try {
      // Group BOM items by operation to create work orders
      const operationGroups = selectedPresetData.product.bom.reduce((groups, bomItem) => {
        if (!groups[bomItem.operation]) {
          groups[bomItem.operation] = []
        }
        groups[bomItem.operation].push(bomItem)
        return groups
      }, {} as Record<string, BOMItem[]>)

      // Create work orders from operation groups
      const workOrders = Object.entries(operationGroups).map(([operation, bomItems], index) => {
        const totalDuration = bomItems.reduce((total, item) => total + (item.opDurationMins * quantity), 0)
        
        return {
          operation: operation,
          status: "to_do",
          comments: `${operation} for ${selectedPresetData.product.name}`,
          durationMins: totalDuration,
          workCenterId: (index % 3) + 1, // Distribute across work centers 1, 2, 3
          assignedToId: assignedToId
        }
      })

      const draftData = {
        id: order.id,
        userId: userId,
        productId: selectedPresetData.productId,
        product: {
          name: selectedPresetData.product.name,
          description: selectedPresetData.product.description,
          unit: selectedPresetData.product.unit
        },
        quantity: quantity,
        scheduleStartDate: scheduleStartDate ? new Date(scheduleStartDate).toISOString() : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        assignedToId: assignedToId,
        components: selectedPresetData.product.bom.map(bomItem => ({
          componentId: bomItem.componentId,
          quantity: bomItem.quantity * quantity,
          operation: bomItem.operation,
          opDurationMins: bomItem.opDurationMins
        })),
        workOrders: workOrders,
        status: "draft"
      }
      console.log(draftData)
      const response = await moApi.saveDraft(draftData)
      console.log('Draft saved:', response)
      
      // Show success message (you can replace with a toast notification)
      // alert('Draft saved successfully!')
      
    } catch (error) {
      
      console.error('Error saving draft:', error)
      // alert('Error saving draft. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='p-2 size-full'>
      <div className='flex gap-2 h-[66px] mb-2'>
        <Button className='text-xl px-6'>Confirm</Button>
        <Button variant='secondary' className='text-xl px-6'>Back</Button>
        <Button onClick={handleSaveDraft} className='text-xl px-6 ml-auto'>Save Draft</Button>
      </div>

      <div className='rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2'>
        <div className='bg-background p-5 px-8 text-2xl font-mono font-medium text-inactive rounded-lg w-fit'>
          MO {order?.id ?? "Loading"}
        </div>
        
        <div className='flex gap-2 w-full'>
          {presets && (
            <Dropdown 
              width={250} 
              currentValue={product ?? "None"} 
              setValue={(selectedProduct: string) => {
                setProduct(selectedProduct)
                handlePresetSelection(selectedProduct)
              }} 
              values={presets.map((p: Preset) => p.name)} 
            />
          )}
          <Input 
            placeholder='Quantity' 
            type='number' 
            defaultValue='2' 
            onChange={handleQuantityChange}
          />
        </div>
        
        <div className='flex gap-2 w-full'>
          <Input 
            placeholder='Schedule Start Date' 
            type='date' 
            value={scheduleStartDate}
            onChange={(e) => setScheduleStartDate(e.target.value)}
            disabled={isLoading}
          />
          <Input 
            placeholder='Deadline' 
            type='date' 
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className='flex gap-2 w-full'>
          <Input 
            placeholder='Status' 
            defaultValue='draft' 
            disabled={isLoading}
          />
        </div>
        
        <div className='flex gap-2 w-full'>
          <Input 
            placeholder='Assigned To ID' 
            type='number' 
            value={assignedToId}
            onChange={(e) => setAssignedToId(parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        
        <Input 
          placeholder='Total Price' 
          type='number' 
          value={totalPrice > 0 ? totalPrice.toFixed(2) : ''} 
          readOnly 
          disabled={isLoading}
        />
        
        <div className='w-full flex flex-col rounded-xl overflow-hidden border-2 border-border mt-4'>
          <div className='flex w-full h-[60px] text-xl border-b-2 border-b-border'>
            <div 
              className={`w-1/2 flex items-center px-4 cursor-pointer transition-colors ${
                activeTab === 'components' ? 'bg-white font-semibold' : 'bg-zinc-200 hover:bg-zinc-100'
              }`}
              onClick={() => handleTabClick('components')}
            >
              Components
            </div>
            <div 
              className={`w-1/2 flex items-center px-4 cursor-pointer transition-colors ${
                activeTab === 'workorders' ? 'bg-white font-semibold' : 'bg-zinc-200 hover:bg-zinc-100'
              }`}
              onClick={() => handleTabClick('workorders')}
            >
              Work Orders
            </div>
          </div>
          
          <div className='flex flex-col min-h-[200px]'>
            {!selectedPresetData ? (
              <div className='flex items-center justify-center h-32 text-gray-500'>
                Select a product preset to view details
              </div>
            ) : (
              <>
                {activeTab === 'components' && (
                  <div className='p-4'>
                    <ul className='space-y-2'>
                      {selectedPresetData.product.bom.map((bomItem: BOMItem) => {
                        const componentData = componentPrices[bomItem.componentId]
                        const price = componentData?.price || componentData?.cost || 0
                        const totalComponentCost = price * bomItem.quantity * quantity
                        
                        return (
                          <li key={bomItem.id} className='text-gray-700 flex justify-between'>
                            <span>
                              {bomItem.component.name} ({bomItem.quantity * quantity} {bomItem.component.unit})
                            </span>
                            {price > 0 && (
                              <span className='text-gray-500 text-sm'>
                                ${totalComponentCost.toFixed(2)}
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {activeTab === 'workorders' && (
                  <div className='p-4'>
                    <div className='space-y-3'>
                      {selectedPresetData.product.bom
                        .sort((a: BOMItem, b: BOMItem) => a.opDurationMins - b.opDurationMins)
                        .map((bomItem: BOMItem) => (
                        <div key={bomItem.id} className='border rounded-lg p-3 bg-gray-50'>
                          <div className='flex justify-between items-start'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-3 mb-2'>
                                <span className='bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded'>
                                  {bomItem.operation}
                                </span>
                                <span className='text-sm text-gray-500'>
                                  {bomItem.opDurationMins} mins
                                </span>
                              </div>
                              <h4 className='font-medium text-gray-900'>{bomItem.component.name}</h4>
                              <p className='text-sm text-gray-600 mt-1'>{bomItem.component.description}</p>
                              <div className='flex gap-4 mt-2 text-sm'>
                                <span className='text-gray-500'>
                                  Components: <span className='font-medium'>{bomItem.quantity * quantity}</span>
                                </span>
                                <span className='text-gray-500'>
                                  Unit: <span className='font-medium'>{bomItem.component.unit}</span>
                                </span>
                              </div>
                            </div>
                            <div className='text-right'>
                              <div className='text-sm font-medium text-gray-900'>
                                {bomItem.opDurationMins * quantity} mins total
                              </div>
                              <div className='text-xs text-gray-500'>
                                for {quantity} units
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
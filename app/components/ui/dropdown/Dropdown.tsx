"use client"

import { motion } from "motion/react"
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown"
import * as React from "react"

interface DropdownProps {
  width?: string | number
  currentValue: string
  setValue: (value: string) => void
  values: string[]
}

export const Dropdown: React.FC<DropdownProps> = ({
  width = 200,
  currentValue,
  setValue,
  values,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <motion.div className="relative inline-block" style={{ width }}>
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="h-full outline-none px-6 rounded-xl bg-white hover:bg-zinc-100 transition-colors duration-100 flex items-center justify-between border-2 border-border font-medium text-xl w-full"
      >
        {currentValue}
        <motion.div
          transition={{ duration: 0.2, ease: "circInOut" }}
          animate={{ rotateZ: isOpen ? 180 : 0 }}
          initial={{rotateZ: 0}}
        >
          <CaretDown size={20} fill="bold" />
        </motion.div>
      </motion.button>

      <motion.div
        transition={{ duration: 0.2, ease: "circInOut" }}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
          marginTop: isOpen ? 4 : 0,
        }}
        initial={{height: 0, opacity: 0}}
        className="absolute bg-white top-full left-0 rounded-xl overflow-hidden border-2 border-border w-full flex flex-col font-medium text-xl"
      >
        {values.map((value) => (
          <div
            key={value}
            onClick={() => {
              setValue(value)
              setIsOpen(false)
            }}
            className="px-6 h-[60px] flex items-center w-full hover:bg-zinc-100 transition-colors duration-100 cursor-pointer"
          >
            {value}
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

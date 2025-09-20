import { AnimatePresence, motion } from "motion/react";
import React from "react";
import Button from "../ui/button/Button";
import { X } from "@phosphor-icons/react/dist/ssr/X";


const Modal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setOpen(false)}
            className="fixed top-0 left-0 size-full bg-black/5 z-[2000000] flex items-center justify-center"
          >
            <motion.div
              initial={{scale: 0.97}}
              animate={{scale: 1}}
              exit={{scale: 0.97}}
              transition={{duration: 0.2, ease: 'circInOut'}}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-[900px] flex flex-col h-[600px] bg-white shadow-2xl shadow-black/10 border-2 border-border rounded-xl"
            >
              <div className="h-[72px] border-b-2 border-border flex items-center p-2" >
                <div className="px-4 text-2xl font-medium">Create a work order</div>
                <Button onClick={() => setOpen(false)} variant="secondary" className="h-full aspect-square shrink-0 ml-auto" ><X size={20} weight="bold"></X></Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;

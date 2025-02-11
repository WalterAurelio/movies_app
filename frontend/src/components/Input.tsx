import type { ComponentPropsWithoutRef } from 'react';
interface InputPropsPlus extends ComponentPropsWithoutRef<"input"> {
  icon: React.FC
}

function Input({ icon: Icon, ...props }: InputPropsPlus) {
  return (
    <div>
      <div>
        <Icon />
      </div>
      <input
        { ...props }
      />
    </div>
  )
}

export default Input;
import React, { useCallback, useState } from "react";
import MuiRating from "@mui/material/Rating";

type Props = {
  defaultValue?: number;
  disabled?: boolean;
  readOnly?: boolean;
  value?: number | null;
  onChange?: (event: React.SyntheticEvent, value: number | null) => void;
}

export function Rating(props: Props) {
  const [activeValue, setActiveValue] = useState<number | null>(null)
  const handleRef = useCallback((node: HTMLElement & {_ratingTouchEventHandlers?: TouchEventHandlers}) => {
    if (node) {
      if (!node._ratingTouchEventHandlers) {
        node._ratingTouchEventHandlers = new TouchEventHandlers(node)
      }
      node._ratingTouchEventHandlers.activeValue = activeValue
    }
  }, [activeValue])

  return (
    <MuiRating
      ref={!props.readOnly ? handleRef : undefined}
      precision={0.5}
      onChangeActive={(_, value) => setActiveValue(value)}
      size="large"
      {...props}
    />
  )
}

/**
 * https://android.googlesource.com/platform/frameworks/base/+/c5ce225fdf7451badf26eb7fee59300a35f4155d/core/java/android/widget/AbsSeekBar.java#900
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
 * https://web.dev/mobile-touchandmouse/
 */
 class TouchEventHandlers {
  activeValue: number | null = null
  touchDownX: number | null = null
  isDragging = false
  touchSlop = 8

  constructor(private node: HTMLElement) {
    node.addEventListener('touchstart', this.touchStart, false)
    node.addEventListener('touchmove', this.touchMove, false)
    node.addEventListener('touchend', this.touchEnd, false)
    node.addEventListener('touchcancel', this.touchCancel, false)
  }

  touchStart = (event: TouchEvent) => {
    this.touchDownX = event.touches[0].clientX
  }

  touchMove = (event: TouchEvent) => {
    if (this.isDragging) {
      event.preventDefault()
      this.trackTouchEvent(event)
    } else {
      const x = event.touches[0].clientX
      if (Math.abs(x - this.touchDownX!) > this.touchSlop) {
        event.preventDefault()
        this.isDragging = true
        this.trackTouchEvent(event)
      }
    }
  }

  touchEnd = (event: TouchEvent) => {
    if (this.isDragging) {
      this.isDragging = false
      this.trackTouchEvent(event)
      this.commitActiveValue()
    }
    this.triggerMouseLeave()
  }

  touchCancel = () => {
    if (this.isDragging) {
      this.isDragging = false
    }
  }

  private trackTouchEvent(event: TouchEvent) {
    if (event.touches.length === 0) return
    this.node.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: event.touches[0].clientX,
    }))
  }

  private commitActiveValue() {
    const selectedValue = this.activeValue
    if (selectedValue == null) return
    this.node.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(node => {
      if (node.value === selectedValue.toString()) {
        if (!node.checked) {
          node.click()
        }
      }
    })
  }

  private triggerMouseLeave() {
    // trigger mouseleave (React simulates mouseleave by handling mouse*out*)
    this.node.dispatchEvent(new MouseEvent('mouseout', {
      bubbles: true,
    }))
  }
}

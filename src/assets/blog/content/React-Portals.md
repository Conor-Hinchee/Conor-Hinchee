
# Using React Portals with Refs Instead of IDs

When working with React Portals, it's common to attach them to a DOM element using an ID. However, there are scenarios where you might want to attach a portal to a dynamically referenced DOM element instead. This approach can provide more flexibility and eliminate the need for static IDs.

A recent Stack Overflow question highlighted this challenge:

> "I would like to create a Portal component that is supposed to be attached to its container component, but not via the container's ID but by its ref. In other words, I don't want to pass `document.getElementById('CONTAINER_ID')` as the second argument to `ReactDOM.createPortal`, but to rely solely on the ref of the container being passed by `React.forwardRef`."

The initial attempt involved passing `ref.current` directly to `ReactDOM.createPortal`, but this approach did not work as expected. Let's explore why and how to properly achieve this functionality.

## Why Passing `ref.current` Directly Doesn't Work

Portals require a valid DOM node to attach to. If you pass `ref.current` directly and the referenced element is not available during rendering, the portal will fail. This can happen because React updates refs asynchronously, meaning `ref.current` may be `null` at the time of rendering.

Additionally, if the referenced element is conditionally rendered, it may not exist in the DOM when the portal attempts to attach.

## The Solution: Creating and Managing a DOM Node

To reliably attach a portal to a referenced element, we need to:

1. Create a `div` element dynamically.
    
2. Append it to the referenced container.
    
3. Remove it on unmount to prevent memory leaks.
    

Here’s an improved implementation:

```
import React, { useRef, useEffect, forwardRef, MutableRefObject } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  state: { open: boolean };
  component: React.ReactNode;
}

const PortalComponent = forwardRef<HTMLDivElement, Props>(
  ({ state, component }, ref) => {
    if (!state.open) return null;

    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    const targetEl = ref as MutableRefObject<HTMLDivElement | null>;

    useEffect(() => {
      const target = targetEl?.current;
      if (!target) return;

      if (!portalContainerRef.current) {
        portalContainerRef.current = document.createElement('div');
        target.appendChild(portalContainerRef.current);
      }

      return () => {
        if (portalContainerRef.current && target.contains(portalContainerRef.current)) {
          target.removeChild(portalContainerRef.current);
        }
        portalContainerRef.current = null;
      };
    }, [targetEl?.current]);

    if (!portalContainerRef.current) return null;

    return ReactDOM.createPortal(
      <div>
        {component}
      </div>,
      portalContainerRef.current
    );
  }
);

export default PortalComponent;
```

### Usage Example

To use this `PortalComponent`, we create a container element and pass its ref:

```
import React, { useRef, useState } from 'react';
import PortalComponent from './PortalComponent';

const ExamplePortal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const PortalContent = () => (
    <div>
      <h3>Portal Content</h3>
      <p>This content is rendered inside the portal</p>
    </div>
  );

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Portal</button>
      <div ref={containerRef} style={{ position: 'relative', minHeight: '200px' }}>
        <PortalComponent ref={containerRef} state={{ open: isOpen }} component={<PortalContent />} />
      </div>
    </div>
  );
};

export default ExamplePortal;
```

## Why This Works

- **Ensures the target exists**: The portal container is only created when the reference is available.
    
- **Avoids memory leaks**: The dynamically created `div` is removed on unmount.
    
- **No need for IDs**: The portal attaches dynamically using refs, improving reusability and maintainability.
    

## Conclusion

By dynamically creating and managing a DOM node, we can successfully attach React Portals to a referenced container instead of relying on hardcoded IDs. This approach ensures flexibility, prevents memory leaks, and maintains React’s declarative rendering principles.
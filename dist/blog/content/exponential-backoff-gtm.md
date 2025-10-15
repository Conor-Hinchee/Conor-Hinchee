# 📈 Exponential Backoff in Google Tag Manager

When working with third-party scripts like Zendesk Chat (`zE`) in dynamic environments, race conditions can cause your customizations to fail if the required DOM or scripts haven’t loaded yet. This is especially relevant when injecting code via **Google Tag Manager (GTM)**, where load timing is unpredictable.

---

## ✅ What We’re Solving
 
Attempting to bind event listeners before the DOM element exists—or before they are ready it will ready—will silently fail. A simple fix would be retrying after a delay, but that can lead to performance issues if not done thoughtfully.

Enter: **Exponential Backoff**.

---

## 🔧 Exponential Backoff

```html
<script>
  function exponentialBackoff(
    actionFn,
    { maxRetries = 5, baseDelay = 500, label = "Backoff" } = {}
  ) {
    let attempt = 0;

    const retry = () => {
      if (attempt >= maxRetries) {
        console.warn(`[${label}] Max retries reached. Aborting.`);
        return;
      }

      actionFn((error) => {
        if (error) {
          attempt++;
          const delay = Math.pow(2, attempt) * baseDelay;
          console.log(`[${label}] Retrying in ${delay}ms (Attempt ${attempt})`);
          setTimeout(retry, delay);
        } else {
          console.log(`[${label}] Succeeded on attempt ${attempt + 1}`);
        }
      });
    };

    retry();
  }

  function waitForElement(callback) {

    const dynamicElement = document.querySelector('#dynamic-element');
    if (!dynamicElement) {
      return callback(new Error("element does not exist"));
    }

    try {
      dynamicElement.href = "javascript:void(0)";
      dynamicElement.addEventListener("click", () => {
        console.log('handling click');
      });
      callback(null); // success
    } catch (err) {
      callback(err);
    }
  }

  exponentialBackoff(waitForElement, {
    maxRetries: 5,
    baseDelay: 500,
    label: "Adding listener to element",
  });
</script>
```

---

## 💡 Why Use Exponential Backoff in GTM?

When GTM injects scripts, it's often asynchronous with both your frontend framework and any third-party services like Zendesk. That means:

- DOM elements might not exist yet
- External scripts may not have initialized

Exponential backoff gives these dependencies time to load without resorting to infinite or tightly looped polling.

---

## 📎 How to Use This in GTM

1. **Create a Custom HTML Tag**
   - Paste the `<script>` code above.
2. **Trigger Type**: Use `Window Loaded` or `DOM Ready` depending on when your elements typically appear.
3. **Preview & Test**: Ensure that the chat button behaves as expected across slow and fast page loads.

---


When you're working with third-party scripts and GTM, load order isn’t guaranteed. Adding a reusable exponential backoff utility to your toolbox ensures resilience in environments where timing is unpredictable.

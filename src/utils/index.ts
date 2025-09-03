export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatDate(date: string | Date): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleDateString("zh-CN")
}

export function formatDateTime(date: string | Date): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleString("zh-CN")
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: any
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function downloadFile(content: string, filename: string, type = "text/plain") {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // 兼容旧浏览器
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}

export function getFieldIcon(type: string): string {
  const iconMap: Record<string, string> = {
    text: "Type",
    number: "Hash",
    date: "Calendar",
    select: "ChevronDown",
    multiSelect: "Tags",
    user: "User",
    checkbox: "CheckSquare",
    url: "Link",
    email: "Mail",
    phone: "Phone",
  }
  return iconMap[type] || "Type"
}

export function validateField(value: any, field: any): string | null {
  if (field.required && (value === null || value === undefined || value === "")) {
    return `${field.name}是必填字段`
  }

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return "请输入有效的邮箱地址"
    }
  }

  if (field.type === "phone" && value) {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      return "请输入有效的手机号码"
    }
  }

  if (field.type === "url" && value) {
    try {
      new URL(value)
    } catch {
      return "请输入有效的URL地址"
    }
  }

  return null
}

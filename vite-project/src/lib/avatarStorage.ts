const key = (userId: string) => `avatar_${userId}`

export function getAvatar(userId: string): string | null {
  return localStorage.getItem(key(userId))
}

export function saveAvatar(userId: string, dataUrl: string): void {
  localStorage.setItem(key(userId), dataUrl)
}

export function removeAvatar(userId: string): void {
  localStorage.removeItem(key(userId))
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

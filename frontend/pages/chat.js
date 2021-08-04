import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Chat() {
  const router = useRouter()
  useEffect(() => {
    if (!localStorage.getItem("user")) { router.replace('/') }
  }, [])
  return <>hello</>

}

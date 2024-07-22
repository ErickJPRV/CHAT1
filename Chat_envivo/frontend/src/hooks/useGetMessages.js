import React, { useEffect, useState } from 'react'
import useConversation from '../zustand/useConversation'
import toast from 'react-hot-toast';

export const useGetMessages = () => {
    const [loading,setLoading] = useState(false)
    const {messages,setMessages,selectedConversation}=useConversation();

    useEffect(()=>{
        const getMessages = async()=>{
            setLoading(true)
            try{
                const res=await fetch(`/api/message/${selectedConversation.id}`);
                const data = await res.json();
                if(data.error) throw new Error(data.error)
                setMessages(data)
            }catch(error){
                toast.error(error.message)
            } finally{
                setLoading(false)
            }
        }
        if(selectedConversation?.id) getMessages()
    },[selectedConversation?.id,setMessages])
return {messages,loading}
}
export default useGetMessages;

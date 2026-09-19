import { supabase } from './services/supabase.js'
import { useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import MessageArea from './components/MessageArea.jsx'
import InputBar from './components/InputBar.jsx'
import Login from './components/Login.jsx'
import { sendMessage, warmupBackend } from './services/chatService.js'


export default function App() {
  useEffect(() => {
    warmupBackend()
  }, [])

  const [messages, setMessages] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState(null)
  

  // CHATS - stored in Supabase, not localStorage
  const [chats, setChats] = useState([])

  const [activeChatId, setActiveChatId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const chatRef = useRef(null)
  const getChatIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('chat')
}

  // CHECK IF USER IS ALREADY LOGGED IN
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        setUser(data.user)
        setIsLoggedIn(true)
      }

      setAuthLoading(false)
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setUser(session.user)
          setIsLoggedIn(true)
        } else {
          setUser(null)
          setIsLoggedIn(false)
          setChats([])
          setMessages([])
          setActiveChatId(null)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  // LOAD CHATS FROM SUPABASE FOR THE LOGGED-IN USER ONLY
  // LOAD CHATS FROM SUPABASE FOR THE LOGGED-IN USER ONLY
useEffect(() => {
  if (!user) return

  const loadChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('id, user_id, title, messages, pinned, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load chats:', error)
      setChats([])
      return
    }

    const loadedChats = data || []

    setChats(loadedChats)

    // Restore the chat that was active before
    const chatIdFromUrl = getChatIdFromUrl()

    if (chatIdFromUrl) {
      const activeChat = loadedChats.find(
        (chat) =>
          String(chat.id) === String(chatIdFromUrl),
      )

      if (activeChat) {
        setActiveChatId(activeChat.id)
        setMessages(activeChat.messages || [])
      }
    }
  }

  loadChats()
}, [user?.id])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight
    }
  }, [messages])

  const updateChatMessages = async (
    chatId,
    updatedMessages,
  ) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: updatedMessages,
            }
          : chat,
      ),
    )

    const { error } = await supabase
      .from('chats')
      .update({ messages: updatedMessages })
      .eq('id', chatId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to save messages:', error)
    }
  }

  const handleSend = async (text) => {
  if (!text.trim() || isLoading || !user) return

  let chatId = activeChatId

  const userMessage = {
    role: 'user',
    text,
  }

  const updatedMessages = [
    ...messages,
    userMessage,
  ]

  if (!chatId) {
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        title: text.slice(0, 40),
        messages: updatedMessages,
        pinned: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create chat:', error)
      return
    }

    chatId = newChat.id

    setChats((prev) => [
      newChat,
      ...prev,
    ])

    setActiveChatId(chatId)

    window.history.replaceState(
      {},
      '',
      `?chat=${chatId}`,
    )
  }

  setMessages(updatedMessages)
  setIsLoading(true)

  try {
    const response = await sendMessage(text)

    const assistantMessage = {
      role: 'assistant',
      text: response.answer,
      sources: response.sources,
      status: response.status,
    }

    const finalMessages = [
      ...updatedMessages,
      assistantMessage,
    ]

    setMessages(finalMessages)

    await updateChatMessages(
      chatId,
      finalMessages,
    )
  } finally {
    setIsLoading(false)
  }
}

  const handleRegenerate = async (messageIndex) => {
    if (isLoading || !user) return

    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find(
        (message) =>
          message.role === 'user',
      )

    if (!previousUserMessage) return

    setIsLoading(true)

    try {
      const response = await sendMessage(
        previousUserMessage.text,
      )

      const updatedMessages = messages.map(
        (message, index) =>
          index === messageIndex
            ? {
                ...message,
                text: response.answer,
                sources: response.sources,
                status: response.status,
              }
            : message,
      )

      setMessages(updatedMessages)

      if (activeChatId) {
        await updateChatMessages(
          activeChatId,
          updatedMessages,
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectChat = (chat) => {
  setActiveChatId(chat.id)
  setMessages(chat.messages || [])
  setIsLoading(false)

  window.history.replaceState(
    {},
    '',
    `?chat=${chat.id}`,
  )
}

 const handleNewChat = () => {
  setMessages([])
  setActiveChatId(null)
  setIsLoading(false)

  window.history.replaceState({}, '', window.location.pathname)
}

  const handleRenameChat = async (
    chatId,
    newTitle,
  ) => {
    if (!newTitle.trim() || !user) return

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: newTitle,
            }
          : chat,
      ),
    )

    const { error } = await supabase
      .from('chats')
      .update({ title: newTitle })
      .eq('id', chatId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to rename chat:', error)
    }
  }

  const handleDeleteChat = async (chatId) => {
    if (!user) return

    setChats((prev) =>
      prev.filter(
        (chat) => chat.id !== chatId,
      ),
    )

    if (activeChatId === chatId) {
      setMessages([])
      setActiveChatId(null)
    }

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const handlePinChat = async (chatId) => {
    if (!user) return

    const chat = chats.find(
      (item) => item.id === chatId,
    )

    if (!chat) return

    const nextPinned = !chat.pinned

    setChats((prev) =>
      prev.map((item) =>
        item.id === chatId
          ? {
              ...item,
              pinned: nextPinned,
            }
          : item,
      ),
    )

    const { error } = await supabase
      .from('chats')
      .update({ pinned: nextPinned })
      .eq('id', chatId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to update pinned state:', error)
    }
  }

  // REAL SUPABASE SIGN OUT
  const handleSignOut = async () => {
    await supabase.auth.signOut()

    setUser(null)
    setIsLoggedIn(false)
    setChats([])
    setMessages([])
    setActiveChatId(null)
  }

  // WAIT WHILE CHECKING SESSION
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ledger-paper">
        <p className="font-serif text-ledger-ink">
          Loading...
        </p>
      </div>
    )
  }

  // SHOW LOGIN PAGE
  if (!isLoggedIn) {
    return <Login />
  }

  // SHOW MAIN APP
  return (
    <div className="flex h-screen overflow-hidden bg-ledger-paper">
      <Sidebar
        user={user}
        chats={chats}
        activeChatId={activeChatId}
        sidebarOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main
          ref={chatRef}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <MessageArea
            messages={messages}
            onQuestionClick={handleSend}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </main>

        <InputBar
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

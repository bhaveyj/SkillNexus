"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader } from "@/components/ui/loader"
import { useToast } from "@/components/ui/toast"
import { Search, Plus, X, ArrowLeftRight, Users, BookOpen, Check, User, MessageSquare } from "lucide-react"
import { ChatDialog } from "@/components/chat/ChatDialog"

interface Skill {
  id: string
  name: string
  category: string
  _count?: {
    offers: number
    requests: number
  }
}

interface Offer {
  id: string
  skill: Skill
}

interface Request {
  id: string
  skill: Skill
}

const categoryColors: Record<string, string> = {
  DEVOPS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CLOUD: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  WEB_DEVELOPMENT: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  FRONTEND: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  BACKEND: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  MOBILE: "bg-green-500/10 text-green-500 border-green-500/20",
  DATABASE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DATA_SCIENCE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  AI_ML: "bg-red-500/10 text-red-500 border-red-500/20",
  UI_UX: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  CYBERSECURITY: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  BLOCKCHAIN: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  GAME_DEVELOPMENT: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
  TESTING: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

interface UserOffer {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  skill: Skill
  userRequests?: Request[]
}

interface ExchangeRequest {
  id: string
  senderId: string
  receiverId: string
  senderSkillId: string
  receiverSkillId: string
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED"
  message?: string
  createdAt: string
  sender?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  receiver?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  senderSkill: Skill
  receiverSkill: Skill
}

export default function MarketplacePage() {
  const { data: session } = useSession()
  const { toast, toasts } = useToast()
  const [activeTab, setActiveTab] = useState<"browse" | "matches" | "my-skills" | "requests">("browse")
  const [skills, setSkills] = useState<Skill[]>([])
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([])
  const [allOffers, setAllOffers] = useState<UserOffer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<UserOffer[]>([])
  const [myOffers, setMyOffers] = useState<Offer[]>([])
  const [acceptedMatches, setAcceptedMatches] = useState<ExchangeRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ExchangeRequest[]>([])
  const [receivedRequests, setReceivedRequests] = useState<ExchangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [browseSearch, setBrowseSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [browseCategory, setBrowseCategory] = useState<string>("ALL")
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [requestedUsers, setRequestedUsers] = useState<Set<string>>(new Set())
  const [isProposeOpen, setIsProposeOpen] = useState(false)
  const [proposeTarget, setProposeTarget] = useState<(UserOffer & { skills: Skill[] }) | null>(null)
  const [proposeMySkill, setProposeMySkill] = useState<string>("")
  const [proposeTheirSkill, setProposeTheirSkill] = useState<string>("")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [viewingProfile, setViewingProfile] = useState<{
    id: string
    name: string | null
    email: string
    image: string | null
    bio: string | null
    github: string | null
    linkedin: string | null
    twitter: string | null
    gmail: string | null
  } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [chatMatch, setChatMatch] = useState<ExchangeRequest | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const categories = ["ALL", "DEVOPS", "CLOUD", "WEB_DEVELOPMENT", "BACKEND", "FRONTEND", "MOBILE", "DATABASE", "DATA_SCIENCE", "AI_ML", "UI_UX"]

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filterSkills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills, searchQuery, selectedCategory])

  useEffect(() => {
    filterOffers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOffers, browseSearch, browseCategory])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [skillsRes, offersRes, requestsRes, matchesRes, allOffersRes, exchangeRequestsRes] = await Promise.all([
        fetch("/api/skills"),
        fetch("/api/offers"),
        fetch("/api/requests"),
        fetch("/api/matches"),
        fetch("/api/offers?all=true"),
        fetch("/api/exchange-requests"),
      ])

      const [skillsData, offersData, , , allOffersData, exchangeRequestsData] = await Promise.all([
        skillsRes.json(),
        offersRes.json(),
        requestsRes.json(),
        matchesRes.json(),
        allOffersRes.json(),
        exchangeRequestsRes.json(),
      ])

      if (skillsData.success) setSkills(skillsData.data)
      if (offersData.success) setMyOffers(offersData.data)
      if (allOffersData.success) setAllOffers(allOffersData.data)
      if (exchangeRequestsData.sent) setSentRequests(exchangeRequestsData.sent)
      if (exchangeRequestsData.received) setReceivedRequests(exchangeRequestsData.received.filter((r: ExchangeRequest) => r.status === "PENDING"))
      
      // Track users we've already sent requests to
      if (exchangeRequestsData.sent) {
        const requestedUserIds = new Set<string>(exchangeRequestsData.sent.map((r: ExchangeRequest) => r.receiverId))
        setRequestedUsers(requestedUserIds)
      }
      
      // Combine accepted requests from both sent and received
      if (exchangeRequestsData.sent || exchangeRequestsData.received) {
        const accepted = [
          ...(exchangeRequestsData.sent || []).filter((r: ExchangeRequest) => r.status === "ACCEPTED"),
          ...(exchangeRequestsData.received || []).filter((r: ExchangeRequest) => r.status === "ACCEPTED")
        ]
        setAcceptedMatches(accepted)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSkills = () => {
    let filtered = skills

    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((skill) => skill.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter((skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredSkills(filtered)
  }

  const filterOffers = () => {
    let filtered = allOffers

    // Remove logged-in user's offers
    filtered = filtered.filter((offer) => offer.userId !== session?.user?.id)

    if (browseCategory !== "ALL") {
      filtered = filtered.filter((offer) => offer.skill.category === browseCategory)
    }

    if (browseSearch) {
      filtered = filtered.filter((offer) =>
        offer.skill.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
        offer.user.name?.toLowerCase().includes(browseSearch.toLowerCase())
      )
    }

    // Group offers by user to avoid duplicate user cards
    const groupedByUser = filtered.reduce((acc, offer) => {
      const userId = offer.userId
      if (!acc[userId]) {
        acc[userId] = {
          ...offer,
          skills: [offer.skill],
        }
      } else {
        acc[userId].skills.push(offer.skill)
      }
      return acc
    }, {} as Record<string, UserOffer & { skills: Skill[] }>)

    // Sort by matching status - matched users first
    const sorted = Object.values(groupedByUser).sort((a, b) => {
      const aCanExchange = session?.user?.id !== a.userId && 
        (a.userRequests?.some((req: Request) => 
          myOffers.some(myOffer => myOffer.skill.id === req.skill.id)
        ) || a.userRequests?.length === 0)
      const bCanExchange = session?.user?.id !== b.userId && 
        (b.userRequests?.some((req: Request) => 
          myOffers.some(myOffer => myOffer.skill.id === req.skill.id)
        ) || b.userRequests?.length === 0)
      
      // Matched users first
      if (aCanExchange && !bCanExchange) return -1
      if (!aCanExchange && bCanExchange) return 1
      return 0
    })

    setFilteredOffers(sorted as UserOffer[])
  }

  const addMultipleOffers = async () => {
    if (selectedSkills.length === 0) {
      toast({
        title: "No skills selected",
        description: "Please select at least one skill to add",
        variant: "destructive",
      })
      return
    }

    try {
      const promises = selectedSkills.map(skillId =>
        fetch("/api/offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId }),
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length

      toast({
        title: "Success",
        description: `${successCount} skill${successCount !== 1 ? 's' : ''} added to your offerings`,
      })
      
      setSelectedSkills([])
      setIsAddOfferOpen(false)
      fetchData()
    } catch {
      toast({
        title: "Error",
        description: "Failed to add skills",
        variant: "destructive",
      })
    }
  }

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const removeOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/offers?offerId=${offerId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Skill removed from your offerings",
        })
        fetchData()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove skill offer",
        variant: "destructive",
      })
    }
  }

  const sendExchangeRequest = async (receiverId: string, senderSkillId: string, receiverSkillId: string, event?: React.MouseEvent) => {
    // Prevent any default behavior or propagation
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    try {
      const res = await fetch("/api/exchange-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          senderSkillId,
          receiverSkillId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Add user to requested set immediately
        setRequestedUsers(prev => new Set([...prev, receiverId]))
        
        toast({
          title: "Request Sent! 🎉",
          description: "Your exchange request has been sent successfully",
        })
        
        // Update sent requests in background
        const exchangeRequestsRes = await fetch("/api/exchange-requests")
        const exchangeRequestsData = await exchangeRequestsRes.json()
        
        if (exchangeRequestsData.sent) {
          setSentRequests(exchangeRequestsData.sent)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Exchange request error:', error)
      toast({
        title: "Error",
        description: "Failed to send exchange request",
        variant: "destructive",
      })
    }
  }

  const handleProposeExchange = async () => {
    if (!proposeMySkill || !proposeTheirSkill || !proposeTarget) {
      toast({
        title: "Error",
        description: "Please select both skills",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/exchange-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: proposeTarget.userId,
          senderSkillId: proposeMySkill,
          receiverSkillId: proposeTheirSkill,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Exchange Proposed! 🎉",
          description: "Your exchange proposal has been sent",
        })
        setRequestedUsers(prev => new Set(prev).add(proposeTarget.userId))
        setIsProposeOpen(false)
        setProposeMySkill("")
        setProposeTheirSkill("")
        setProposeTarget(null)

        // Update sent requests
        const exchangeRes = await fetch("/api/exchange-requests")
        const exchangeData = await exchangeRes.json()
        if (exchangeData.sent) {
          setSentRequests(exchangeData.sent)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to propose exchange",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to send exchange proposal",
        variant: "destructive",
      })
    }
  }

  const respondToRequest = async (requestId: string, action: "accept" | "decline") => {
    try {
      const res = await fetch("/api/exchange-requests/respond", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: action === "accept" ? "Request Accepted! ✅" : "Request Declined",
          description: action === "accept" 
            ? "You can now connect with this person" 
            : "Request has been declined",
        })
        fetchData()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to respond",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive",
      })
    }
  }

  const fetchUserProfile = async (userId: string) => {
    setLoadingProfile(true)
    try {
      const res = await fetch(`/api/user/${userId}`)
      const data = await res.json()
      if (res.ok) {
        setViewingProfile(data)
        setIsProfileOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoadingProfile(false)
    }
  }

  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Skill Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Exchange skills 1:1 with peers in your areas of interest</p>

          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === "browse" ? "default" : "outline"}
              onClick={() => setActiveTab("browse")}
              size="sm"
              className="cursor-pointer"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Skills
            </Button>
            <Button
              variant={activeTab === "matches" ? "default" : "outline"}
              onClick={() => setActiveTab("matches")}
              size="sm"
              className="cursor-pointer"
            >
              <Users className="w-4 h-4 mr-2" />
              My Matches ({acceptedMatches.length})
            </Button>
            <Button
              variant={activeTab === "requests" ? "default" : "outline"}
              onClick={() => setActiveTab("requests")}
              size="sm"
              className="relative cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Requests
              {receivedRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {receivedRequests.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === "my-skills" ? "default" : "outline"}
              onClick={() => setActiveTab("my-skills")}
              size="sm"
              className="cursor-pointer"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Skills
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {activeTab === "browse" ? (
          <>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search skills or instructors..."
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={browseCategory === cat ? "default" : "outline"}
                    onClick={() => setBrowseCategory(cat)}
                    size="sm"
                    className="text-xs cursor-pointer"
                  >
                    {formatCategory(cat)}
                  </Button>
                ))}
              </div>
            </div>

            {filteredOffers.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No skill offerings found. Try adjusting your search or filters.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffers.map((offer: UserOffer & { skills?: Skill[] }) => {
                  const canExchange = session?.user?.id !== offer.userId && 
                    (offer.userRequests?.some((req: Request) => 
                      myOffers.some(myOffer => myOffer.skill.id === req.skill.id)
                    ) || offer.userRequests?.length === 0) // Allow exchange even if they have no requests
                  const isMe = session?.user?.id === offer.userId
                  const hasRequested = requestedUsers.has(offer.userId)
                  const skills = offer.skills || [offer.skill]
                  
                  return (
                    <Card key={offer.userId} className="hover:border-primary/50 hover:shadow-sm transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={offer.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${offer.user.name}`}
                              alt={offer.user.name || 'User'}
                              className="w-10 h-10 rounded-lg"
                            />
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">
                                {isMe ? "You" : offer.user.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">{offer.user.email}</p>
                            </div>
                          </div>
                          {canExchange && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              Can Exchange
                            </Badge>
                          )}
                          {isMe && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">Can teach:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {skills.map((skill: Skill) => (
                              <Badge
                                key={skill.id}
                                variant="outline"
                                className={`px-2 py-1 text-xs ${categoryColors[skill.category] || ""}`}
                              >
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {offer.userRequests && offer.userRequests.length > 0 && (
                          <div className="mb-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">Wants to learn:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {offer.userRequests.slice(0, 3).map((req: Request) => {
                                const iCanTeach = myOffers.some(myOffer => myOffer.skill.id === req.skill.id)
                                return (
                                  <Badge
                                    key={req.id}
                                    variant="outline"
                                    className={`text-xs ${iCanTeach ? 'bg-green-500/10 border-green-500/20 text-green-500' : ''}`}
                                  >
                                    {req.skill.name}
                                    {iCanTeach && " ✓"}
                                  </Badge>
                                )
                              })}
                              {offer.userRequests.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{offer.userRequests.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {!isMe && canExchange && !hasRequested && (
                          <Button 
                            size="sm" 
                            className="w-full h-8 text-xs cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setProposeTarget({ ...offer, skills: offer.skills || [offer.skill] })
                              setIsProposeOpen(true)
                            }}
                          >
                            Request Exchange
                          </Button>
                        )}
                        {!isMe && canExchange && hasRequested && (
                          <Button size="sm" className="w-full h-8 text-xs bg-purple-500 hover:bg-purple-500 text-white" disabled>
                            ✓ Requested
                          </Button>
                        )}
                        {!isMe && !canExchange && !hasRequested && (
                          <Button 
                            size="sm" 
                            className="w-full h-8 text-xs cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setProposeTarget({ ...offer, skills: offer.skills || [offer.skill] })
                              setIsProposeOpen(true)
                            }}
                          >
                            Propose Exchange
                          </Button>
                        )}
                        {!isMe && !canExchange && hasRequested && (
                          <Button size="sm" className="w-full h-8 text-xs bg-purple-500 hover:bg-purple-500 text-white" disabled>
                            ✓ Requested
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        ) : activeTab === "matches" ? (
          <>
            {acceptedMatches.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No accepted matches yet. Browse skills and send exchange requests to connect with others!
                </p>
                <Button onClick={() => setActiveTab("browse")}>
                  Browse Skills
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {acceptedMatches.map((match) => {
                  // Determine if current user is sender or receiver
                  const isUserSender = match.senderId === session?.user?.id
                  const otherPerson = isUserSender ? match.receiver : match.sender
                  const mySkill = isUserSender ? match.senderSkill : match.receiverSkill
                  const theirSkill = isUserSender ? match.receiverSkill : match.senderSkill

                  return (
                    <Card key={match.id} className="hover:border-primary/50 hover:shadow-sm transition-all border-green-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={otherPerson?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPerson?.name}`}
                              alt={otherPerson?.name || 'User'}
                              className="w-10 h-10 rounded-lg"
                            />
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{otherPerson?.name}</h3>
                              <p className="text-xs text-muted-foreground">{otherPerson?.email}</p>
                            </div>
                          </div>
                          <Badge variant="default" className="text-xs bg-green-500">
                            ✓ Matched
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <ArrowLeftRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">You teach</p>
                                <p className="text-sm font-medium text-green-500">{mySkill.name}</p>
                                <Badge variant="outline" className={`text-xs mt-1 ${categoryColors[mySkill.category] || ""}`}>
                                  {formatCategory(mySkill.category)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <ArrowLeftRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">You learn</p>
                                <p className="text-sm font-medium text-blue-500">{theirSkill.name}</p>
                                <Badge variant="outline" className={`text-xs mt-1 ${categoryColors[theirSkill.category] || ""}`}>
                                  {formatCategory(theirSkill.category)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mb-3">
                          Matched on {new Date(match.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 h-8 text-xs cursor-pointer"
                            onClick={() => otherPerson && fetchUserProfile(otherPerson.id)}
                            disabled={loadingProfile || !otherPerson}
                          >
                            <User className="w-3 h-3 mr-1" />
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs cursor-pointer"
                            onClick={() => {
                              setChatMatch(match)
                              setIsChatOpen(true)
                            }}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        ) : activeTab === "my-skills" ? (
          <div className="space-y-6">
            {/* Skills I Can Teach */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Skills I Can Teach</h3>
                    <p className="text-sm text-muted-foreground">Add skills you can offer to enable skill exchanges</p>
                  </div>
                  <Button size="sm" onClick={() => setIsAddOfferOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>

                <Dialog open={isAddOfferOpen} onOpenChange={(open) => {
                  setIsAddOfferOpen(open)
                  if (!open) setSelectedSkills([])
                }}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <DialogTitle>Add Skills You Can Teach</DialogTitle>
                            <DialogDescription>
                              Select multiple skills you can teach from our catalog
                            </DialogDescription>
                          </div>
                          {selectedSkills.length > 0 && (
                            <Button 
                              onClick={addMultipleOffers}
                              size="sm"
                              className="ml-4"
                            >
                              Add {selectedSkills.length} Skill{selectedSkills.length !== 1 ? 's' : ''}
                            </Button>
                          )}
                        </div>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <Button
                              key={cat}
                              variant={selectedCategory === cat ? "default" : "outline"}
                              onClick={() => setSelectedCategory(cat)}
                              size="sm"
                              className="text-xs"
                            >
                              {formatCategory(cat)}
                            </Button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                          {filteredSkills.map((skill) => {
                            const alreadyOffered = myOffers.some((o) => o.skill.id === skill.id)
                            const isSelected = selectedSkills.includes(skill.id)
                            return (
                              <Button
                                key={skill.id}
                                variant={isSelected ? "default" : "outline"}
                                className="justify-start h-auto py-2 px-3"
                                onClick={() => !alreadyOffered && toggleSkillSelection(skill.id)}
                                disabled={alreadyOffered}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {alreadyOffered ? (
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  ) : isSelected ? (
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-medium truncate">{skill.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {formatCategory(skill.category)}
                                    </p>
                                  </div>
                                </div>
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </DialogContent>
                </Dialog>

                {myOffers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No skills added yet. Add skills you can teach to start matching.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myOffers.map((offer) => (
                      <Badge
                        key={offer.id}
                        variant="outline"
                        className={`px-3 py-1.5 ${categoryColors[offer.skill.category] || ""}`}
                      >
                        {offer.skill.name}
                        <button
                          onClick={() => removeOffer(offer.id)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "requests" ? (
          <div className="space-y-6">
            {/* Received Requests (Pending) */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Pending Requests</h3>
                  <p className="text-sm text-muted-foreground">People want to exchange skills with you</p>
                </div>

                {receivedRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No pending requests at the moment
                  </p>
                ) : (
                  <div className="space-y-4">
                    {receivedRequests.map((request) => (
                      <div key={request.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={request.sender?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.sender?.name}`}
                              alt={request.sender?.name || 'User'}
                              className="w-10 h-10 rounded-lg"
                            />
                            <div>
                              <h4 className="text-sm font-semibold">{request.sender?.name}</h4>
                              <p className="text-xs text-muted-foreground">{request.sender?.email}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">They offer</p>
                            <p className="text-sm font-medium text-green-500">{request.senderSkill.name}</p>
                            <Badge variant="outline" className={`text-xs mt-1 ${categoryColors[request.senderSkill.category] || ""}`}>
                              {formatCategory(request.senderSkill.category)}
                            </Badge>
                          </div>

                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">They want</p>
                            <p className="text-sm font-medium text-blue-500">{request.receiverSkill.name}</p>
                            <Badge variant="outline" className={`text-xs mt-1 ${categoryColors[request.receiverSkill.category] || ""}`}>
                              {formatCategory(request.receiverSkill.category)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => respondToRequest(request.id, "accept")}
                          >
                            Accept Exchange
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => respondToRequest(request.id, "decline")}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sent Requests */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Sent Requests</h3>
                  <p className="text-sm text-muted-foreground">Requests you&apos;ve sent to others</p>
                </div>

                {sentRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    You haven&apos;t sent any requests yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sentRequests.map((request) => (
                      <div key={request.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={request.receiver?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.receiver?.name}`}
                              alt={request.receiver?.name || 'User'}
                              className="w-10 h-10 rounded-lg"
                            />
                            <div>
                              <h4 className="text-sm font-semibold">{request.receiver?.name}</h4>
                              <p className="text-xs text-muted-foreground">{request.receiver?.email}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={request.status === "PENDING" ? "secondary" : request.status === "ACCEPTED" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {request.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">You offer</p>
                            <p className="text-sm font-medium text-green-500">{request.senderSkill.name}</p>
                            <Badge variant="outline" className={`text-xs mt-1 ${categoryColors[request.senderSkill.category] || ""}`}>
                              {formatCategory(request.senderSkill.category)}
                            </Badge>
                          </div>

                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">You want</p>
                            <p className="text-sm font-medium text-blue-500">{request.receiverSkill.name}</p>
                            <Badge variant="outline" className={`text-xs mt-1 ${categoryColors[request.receiverSkill.category] || ""}`}>
                              {formatCategory(request.receiverSkill.category)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border px-4 py-3 shadow-lg ${
              t.variant === "destructive"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && <p className="text-xs mt-1">{t.description}</p>}
          </div>
        ))}
      </div>

      {/* Propose Exchange Dialog */}
      <Dialog open={isProposeOpen} onOpenChange={setIsProposeOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Propose Skill Exchange</DialogTitle>
            <DialogDescription>
              Choose a skill you can teach and optionally select a skill you want to learn from {proposeTarget?.user?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Their Info */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <img
                src={proposeTarget?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${proposeTarget?.user?.name}`}
                alt={proposeTarget?.user?.name || 'User'}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h4 className="font-semibold">{proposeTarget?.user?.name}</h4>
                <p className="text-sm text-muted-foreground">{proposeTarget?.user?.email}</p>
              </div>
            </div>

            {/* Select My Skill */}
            <div className="space-y-2">
              <label className="text-sm font-medium">I can teach:</label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {myOffers.map((offer) => (
                  <button
                    key={offer.id}
                    onClick={() => setProposeMySkill(offer.skill.id)}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                      proposeMySkill === offer.skill.id
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <p className="text-sm font-medium">{offer.skill.name}</p>
                    <Badge variant={proposeMySkill === offer.skill.id ? "secondary" : "outline"} className={`text-xs mt-1 ${proposeMySkill === offer.skill.id ? "" : categoryColors[offer.skill.category] || ""}`}>
                      {formatCategory(offer.skill.category)}
                    </Badge>
                  </button>
                ))}
              </div>
              {myOffers.length === 0 && (
                <p className="text-sm text-muted-foreground">You need to add skills you can teach first</p>
              )}
            </div>

            {/* Select Their Skill */}
            <div className="space-y-2">
              <label className="text-sm font-medium">I want to learn:</label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {proposeTarget?.skills?.map((skill: Skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setProposeTheirSkill(skill.id)}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                      proposeTheirSkill === skill.id
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <p className="text-sm font-medium">{skill.name}</p>
                    <Badge variant={proposeTheirSkill === skill.id ? "secondary" : "outline"} className={`text-xs mt-1 ${proposeTheirSkill === skill.id ? "" : categoryColors[skill.category] || ""}`}>
                      {formatCategory(skill.category)}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleProposeExchange}
                disabled={!proposeMySkill || !proposeTheirSkill}
                className="flex-1 cursor-pointer"
              >
                Send Proposal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsProposeOpen(false)
                  setProposeMySkill("")
                  setProposeTheirSkill("")
                  setProposeTarget(null)
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Connect with this user through their social links
            </DialogDescription>
          </DialogHeader>
          {viewingProfile && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                {viewingProfile.image ? (
                  <img
                    src={viewingProfile.image}
                    alt={viewingProfile.name || "User"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{viewingProfile.name}</h3>
                  {viewingProfile.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{viewingProfile.bio}</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Connect via</h4>
                <div className="grid gap-2">
                  {viewingProfile.github && (
                    <a
                      href={viewingProfile.github.startsWith("http") ? viewingProfile.github : `https://github.com/${viewingProfile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="text-sm font-medium">GitHub</span>
                    </a>
                  )}
                  {viewingProfile.linkedin && (
                    <a
                      href={viewingProfile.linkedin.startsWith("http") ? viewingProfile.linkedin : `https://linkedin.com/in/${viewingProfile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  )}
                  {viewingProfile.twitter && (
                    <a
                      href={viewingProfile.twitter.startsWith("http") ? viewingProfile.twitter : `https://twitter.com/${viewingProfile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-sm font-medium">Twitter / X</span>
                    </a>
                  )}
                  {viewingProfile.gmail && (
                    <a
                      href={`mailto:${viewingProfile.gmail}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                      <span className="text-sm font-medium">Email</span>
                    </a>
                  )}
                  {!viewingProfile.github && !viewingProfile.linkedin && !viewingProfile.twitter && !viewingProfile.gmail && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No social links available</p>
                      <p className="text-xs mt-1">This user hasn&apos;t added any contact information yet</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsProfileOpen(false)}
                className="w-full cursor-pointer"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {chatMatch && (
        <ChatDialog
          open={isChatOpen}
          onOpenChange={(open) => {
            setIsChatOpen(open)
            if (!open) setChatMatch(null)
          }}
          match={chatMatch}
        />
      )}
    </div>
  )
}

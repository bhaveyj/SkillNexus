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
import { Search, Plus, X, ArrowLeftRight, Users, BookOpen, Check } from "lucide-react"

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
  const { toast } = useToast()
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

    if (browseCategory !== "ALL") {
      filtered = filtered.filter((offer) => offer.skill.category === browseCategory)
    }

    if (browseSearch) {
      filtered = filtered.filter((offer) =>
        offer.skill.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
        offer.user.name?.toLowerCase().includes(browseSearch.toLowerCase())
      )
    }

    setFilteredOffers(filtered)
  }

  const addOffer = async (skillId: string) => {
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Skill added to your offerings",
        })
        fetchData()
        setIsAddOfferOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill offer",
        variant: "destructive",
      })
    }
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

  const sendExchangeRequest = async (receiverId: string, senderSkillId: string, receiverSkillId: string) => {
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
        toast({
          title: "Request Sent! 🎉",
          description: "Your exchange request has been sent",
        })
        fetchData()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send request",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to send exchange request",
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
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Skills
            </Button>
            <Button
              variant={activeTab === "matches" ? "default" : "outline"}
              onClick={() => setActiveTab("matches")}
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              My Matches ({acceptedMatches.length})
            </Button>
            <Button
              variant={activeTab === "requests" ? "default" : "outline"}
              onClick={() => setActiveTab("requests")}
              size="sm"
              className="relative"
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
                    className="text-xs"
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
                {filteredOffers.map((offer) => {
                  const canExchange = session?.user?.id !== offer.userId && 
                    offer.userRequests?.some(req => 
                      myOffers.some(myOffer => myOffer.skill.id === req.skill.id)
                    )
                  const isMe = session?.user?.id === offer.userId
                  
                  return (
                    <Card key={offer.id} className="hover:border-primary/50 hover:shadow-sm transition-all">
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
                          <Badge
                            variant="outline"
                            className={`px-3 py-1.5 ${categoryColors[offer.skill.category] || ""}`}
                          >
                            {offer.skill.name}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCategory(offer.skill.category)}
                          </p>
                        </div>

                        {offer.userRequests && offer.userRequests.length > 0 && (
                          <div className="mb-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">Wants to learn:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {offer.userRequests.slice(0, 3).map((req) => {
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

                        {!isMe && canExchange && (
                          <Button 
                            size="sm" 
                            className="w-full h-8 text-xs"
                            onClick={() => {
                              // Find the matching skill from their requests that we offer
                              const matchingRequest = offer.userRequests?.find(req => 
                                myOffers.some(myOffer => myOffer.skill.id === req.skill.id)
                              )
                              const myMatchingOffer = myOffers.find(myOffer => 
                                myOffer.skill.id === matchingRequest?.skill.id
                              )
                              
                              if (matchingRequest && myMatchingOffer) {
                                sendExchangeRequest(offer.userId, myMatchingOffer.skill.id, offer.skill.id)
                              }
                            }}
                          >
                            Request Exchange
                          </Button>
                        )}
                        {!isMe && !canExchange && (
                          <Button size="sm" variant="outline" className="w-full h-8 text-xs" disabled>
                            No Match Available
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

                        <Button size="sm" className="w-full h-8 text-xs">
                          Contact for Exchange
                        </Button>
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

                <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add a Skill You Can Teach</DialogTitle>
                        <DialogDescription>
                          Select skills you can teach from our catalog
                        </DialogDescription>
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
                            return (
                              <Button
                                key={skill.id}
                                variant="outline"
                                className="justify-start h-auto py-2 px-3"
                                onClick={() => !alreadyOffered && addOffer(skill.id)}
                                disabled={alreadyOffered}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {alreadyOffered && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
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
    </div>
  )
}

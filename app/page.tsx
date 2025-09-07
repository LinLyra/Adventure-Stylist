"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Palette,
  Sun,
  Cloud,
  Snowflake,
  Leaf,
  Upload,
  Camera,
  Shirt,
  Plus,
  Trash2,
  Mountain,
  Waves,
  TreePine,
  Compass,
} from "lucide-react"

const australianSeasons = [
  {
    id: "summer",
    name: "Summer Vibes",
    description: "Bright, vibrant colors for hot Australian summers",
    icon: <Sun className="w-4 h-4" />,
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
    prompt: "Perfect for beach days, outdoor festivals, and sunny adventures",
  },
  {
    id: "autumn",
    name: "Autumn Earth",
    description: "Warm earth tones for mild Australian autumns",
    icon: <Leaf className="w-4 h-4" />,
    colors: ["#D2691E", "#CD853F", "#DAA520", "#B22222"],
    prompt: "Ideal for hiking, wine tours, and outdoor exploration",
  },
  {
    id: "winter",
    name: "Winter Blues",
    description: "Cool, sophisticated colors for mild winters",
    icon: <Snowflake className="w-4 h-4" />,
    colors: ["#2F4F4F", "#708090", "#F5F5F5", "#4682B4"],
    prompt: "Great for city exploration and cozy outdoor cafes",
  },
  {
    id: "spring",
    name: "Spring Fresh",
    description: "Fresh, light colors for blooming spring",
    icon: <TreePine className="w-4 h-4" />,
    colors: ["#90EE90", "#FFB6C1", "#87CEEB", "#F0E68C"],
    prompt: "Perfect for garden visits, outdoor markets, and nature walks",
  },
]

const popularDestinations = [
  { name: "Sydney Harbour", type: "Urban Coastal", icon: <Waves className="w-4 h-4" /> },
  { name: "Blue Mountains", type: "Mountain", icon: <Mountain className="w-4 h-4" /> },
  { name: "Great Ocean Road", type: "Coastal Drive", icon: <Compass className="w-4 h-4" /> },
  { name: "Uluru", type: "Desert", icon: <Sun className="w-4 h-4" /> },
  { name: "Daintree Rainforest", type: "Tropical", icon: <TreePine className="w-4 h-4" /> },
  { name: "Bondi Beach", type: "Beach", icon: <Waves className="w-4 h-4" /> },
]

interface WardrobeItem {
  id: string
  name: string
  type: string
  color: string
  image?: string
}

/** Pretty multiline text for Textarea; palette line is optional via includePaletteLine */
function formatAdviceToText(
  advice: any,
  opts?: { currentTime?: string; weatherBadge?: string; includePaletteLine?: boolean }
) {
  const lines: string[] = []
  lines.push("🌏 AUSTRALIAN TRAVEL OUTFIT GUIDE", "")
  if (advice?.destination) lines.push(`📍 Destination: ${advice.destination}`)
  if (opts?.currentTime) lines.push(`🕐 Current Time: ${opts.currentTime}`)
  if (opts?.weatherBadge) lines.push(`🌤️ Weather: ${opts?.weatherBadge}`)
  lines.push("")
  if (opts?.includePaletteLine && Array.isArray(advice?.palette) && advice.palette.length) {
    lines.push(`🎨 Palette: ${advice.palette.join(", ")}`, "")
  }
  lines.push("✅ RECOMMENDED OUTFIT")
  if (Array.isArray(advice?.items)) {
    advice.items.forEach((it: any) => lines.push(`• ${it.name} (${it.type})`))
  }
  lines.push("")
  if (advice?.why) {
    lines.push("🧠 Why")
    lines.push(advice.why)
  }
  if (advice?.sustainability?.note) {
    lines.push("", `Note: ${advice.sustainability.note}`)
  }
  return lines.join("\n")
}

const clothingImages = {
  "White T-Shirt": "/white-cotton-t-shirt.png",
  "Blue Jeans": "/blue-denim-jeans.png",
  "Hiking Boots": "/brown-hiking-boots.png",
  "Summer Dress": "/floral-summer-dress.png",
  "Cargo Shorts": "/khaki-cargo-shorts.jpg",
  "Sun Hat": "/wide-brim-sun-hat.png",
  Sneakers: "/white-athletic-sneakers.png",
  Backpack: "/outdoor-hiking-backpack.jpg",
  "Black Hoodie": "/black-casual-hoodie.jpg",
  "Grey Sweatpants": "/grey-cotton-sweatpants.jpg",
  "Red Flannel Shirt": "/red-plaid-flannel-shirt.jpg",
  "Dark Wash Jeans": "/dark-blue-skinny-jeans.jpg",
  "White Canvas Shoes": "/white-canvas-sneakers.jpg",
  "Denim Jacket": "/light-blue-denim-jacket.jpg",
  "Black Leggings": "/black-athletic-leggings.jpg",
  "Striped Long Sleeve": "/navy-white-striped-shirt.jpg",
  "Khaki Chinos": "/beige-khaki-chino-pants.jpg",
  "Leather Boots": "/brown-leather-ankle-boots.jpg",
  Cardigan: "/cream-knit-cardigan.jpg",
  "Polo Shirt": "/navy-blue-polo-shirt.jpg",
}

const destinationImages = {
  "Sydney Harbour": "/sydney-opera-house-harbour-bridge-sunset.jpg",
  "Blue Mountains": "/blue-mountains-eucalyptus-forest-cliffs.jpg",
  "Great Ocean Road": "/great-ocean-road-twelve-apostles-coastal-cliffs.jpg",
  Uluru: "/uluru-ayers-rock-red-desert-sunset.jpg",
  "Daintree Rainforest": "/daintree-tropical-rainforest-canopy.jpg",
  "Bondi Beach": "/bondi-beach-golden-sand-surfers-waves.jpg",
}

export default function TravelOutfitPlatform() {
  const [location, setLocation] = useState("")
  const [selectedStyle, setSelectedStyle] = useState(australianSeasons[0])
  const [outfitAdvice, setOutfitAdvice] = useState("") // Textarea content
  const [isGenerating, setIsGenerating] = useState(false)
  const [weatherInfo, setWeatherInfo] = useState("")
  const [activityType, setActivityType] = useState("")
  const [gender, setGender] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [extractedColors, setExtractedColors] = useState<string[]>([])
  const [advicePalette, setAdvicePalette] = useState<string[]>([]) // visual chips
  const [currentTime, setCurrentTime] = useState("")
  const [realWeatherData, setRealWeatherData] = useState<any>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)

  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([
    { id: "1", name: "White T-Shirt", type: "Top", color: "#FFFFFF", image: clothingImages["White T-Shirt"] },
    { id: "2", name: "Blue Jeans", type: "Bottom", color: "#4169E1", image: clothingImages["Blue Jeans"] },
    { id: "3", name: "Hiking Boots", type: "Shoes", color: "#8B4513", image: clothingImages["Hiking Boots"] },
    { id: "4", name: "Summer Dress", type: "Top", color: "#FFB6C1", image: clothingImages["Summer Dress"] },
    { id: "5", name: "Cargo Shorts", type: "Bottom", color: "#F5DEB3", image: clothingImages["Cargo Shorts"] },
    { id: "6", name: "Sun Hat", type: "Accessory", color: "#DEB887", image: clothingImages["Sun Hat"] },
    { id: "7", name: "Black Hoodie", type: "Top", color: "#000000", image: clothingImages["Black Hoodie"] },
    { id: "8", name: "Grey Sweatpants", type: "Bottom", color: "#808080", image: clothingImages["Grey Sweatpants"] },
    { id: "9", name: "Red Flannel Shirt", type: "Top", color: "#DC143C", image: clothingImages["Red Flannel Shirt"] },
    { id: "10", name: "Dark Wash Jeans", type: "Bottom", color: "#191970", image: clothingImages["Dark Wash Jeans"] },
    { id: "11", name: "White Canvas Shoes", type: "Shoes", color: "#FFFFFF", image: clothingImages["White Canvas Shoes"] },
    { id: "12", name: "Denim Jacket", type: "Outerwear", color: "#6495ED", image: clothingImages["Denim Jacket"] },
    { id: "13", name: "Black Leggings", type: "Bottom", color: "#000000", image: clothingImages["Black Leggings"] },
    { id: "14", name: "Striped Long Sleeve", type: "Top", color: "#000080", image: clothingImages["Striped Long Sleeve"] },
    { id: "15", name: "Khaki Chinos", type: "Bottom", color: "#F0E68C", image: clothingImages["Khaki Chinos"] },
    { id: "16", name: "Leather Boots", type: "Shoes", color: "#8B4513", image: clothingImages["Leather Boots"] },
    { id: "17", name: "Cardigan", type: "Outerwear", color: "#F5F5DC", image: clothingImages["Cardigan"] },
    { id: "18", name: "Polo Shirt", type: "Top", color: "#000080", image: clothingImages["Polo Shirt"] },
  ])

  const [newItem, setNewItem] = useState({ name: "", type: "", color: "#000000" })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string
        setUploadedImage(imageUrl)

        try {
          const response = await fetch("/api/extract-colors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: imageUrl }),
          })
          const data = await response.json()
          setExtractedColors(data.colors || ["#E6B800", "#8B4513", "#228B22", "#87CEEB"])
        } catch (error) {
          console.error("Color extraction failed:", error)
          setExtractedColors(["#E6B800", "#8B4513", "#228B22", "#87CEEB"])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const addWardrobeItem = () => {
    if (newItem.name && newItem.type) {
      const itemImage =
        clothingImages[newItem.name as keyof typeof clothingImages] ||
        `/placeholder.svg?height=100&width=100&query=${newItem.name.replace(/\s+/g, "+")}`

      setWardrobeItems([
        ...wardrobeItems,
        {
          ...newItem,
          id: Date.now().toString(),
          image: itemImage,
        },
      ])
      setNewItem({ name: "", type: "", color: "#000000" })
    }
  }

  const removeWardrobeItem = (id: string) => {
    setWardrobeItems(wardrobeItems.filter((item) => item.id !== id))
  }

  const fetchRealWeather = async (locationName: string) => {
    setIsLoadingWeather(true)
    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(locationName)}`)
      const weatherData = await response.json()
      setRealWeatherData(weatherData)
      return weatherData
    } catch {
      const fallbackWeather = {
        main: { temp: 22, feels_like: 24, humidity: 65 },
        weather: [{ main: "Sunny", description: "clear sky" }],
        wind: { speed: 8 },
        name: locationName,
      }
      setRealWeatherData(fallbackWeather)
      return fallbackWeather
    } finally {
      setIsLoadingWeather(false)
    }
  }

  const generateOutfitAdvice = async () => {
    if (!location.trim()) return
    setIsGenerating(true)

    try {
      const weatherData = await fetchRealWeather(location)
      const weatherBadge =
        weatherData && weatherData.main && weatherData.weather
          ? `${weatherData.main.temp}°C, ${weatherData.weather[0].main}`
          : ""
      setWeatherInfo(weatherBadge)

      const response = await fetch("/api/fashion-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: location,
          seasonStyle: selectedStyle.name,
          activity: activityType || "Hiking",
          style: gender || "Unisex",
          wardrobeItems,
          extractedColors,
        }),
      })
      const data = await response.json()

      if (data?.success && data?.advice) {
        // Work out which palette to visualize (prefer extracted colors)
        const apiPalette: string[] = Array.isArray(data.advice?.palette)
          ? data.advice.palette.slice(0, 5)
          : []

        if ((!extractedColors || extractedColors.length === 0) && apiPalette.length) {
          setExtractedColors(apiPalette)
        }
        const displayPalette =
          extractedColors && extractedColors.length > 0 ? extractedColors.slice(0, 5) : apiPalette
        setAdvicePalette(displayPalette)

        // Hide palette line in text when we have visual chips
        const text = formatAdviceToText(data.advice, {
          currentTime,
          weatherBadge,
          includePaletteLine: displayPalette.length === 0,
        })
        setOutfitAdvice(text)
      } else {
        setAdvicePalette([])
        setOutfitAdvice(`🌏 AUSTRALIAN TRAVEL OUTFIT GUIDE

📍 Destination: ${location}
🕐 Current Time: ${currentTime}
🌤️ Weather: ${weatherInfo || "Please check local conditions"}

🎨 BASIC RECOMMENDATIONS:
• Choose breathable fabrics suitable for Australian climate
• Layer clothing for temperature variations
• Include sun protection (hat, sunglasses, SPF clothing)
• Wear comfortable, closed-toe shoes for outdoor activities
• Consider the local culture and dress appropriately

Note: AI styling service is temporarily unavailable. This is basic travel advice.`)
      }
    } catch (error) {
      console.error("Failed to generate outfit advice:", error)
      setAdvicePalette([])
      setOutfitAdvice(`🌏 AUSTRALIAN TRAVEL OUTFIT GUIDE

📍 Destination: ${location}
🕐 Current Time: ${currentTime}
🌤️ Weather: ${weatherInfo || "Please check local conditions"}

🎨 BASIC RECOMMENDATIONS:
• Choose breathable fabrics suitable for Australian climate
• Layer clothing for temperature variations
• Include sun protection (hat, sunglasses, SPF clothing)
• Wear comfortable, closed-toe shoes for outdoor activities
• Consider the local culture and dress appropriately

Note: AI styling service is temporarily unavailable. This is basic travel advice.`)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleString("en-AU", {
        timeZone: "Australia/Sydney",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      setCurrentTime(timeString)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-blue-50/20 to-green-50/30" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance">Aussie Adventure Stylist</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover perfect outfit colors inspired by Australia's natural landscapes. From beaches to bushland, dress
            in harmony with your destination.
          </p>
          {currentTime && <p className="text-sm text-muted-foreground mt-2">🕐 {currentTime}</p>}
        </div>

        <Tabs defaultValue="planner" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planner">Trip Planner</TabsTrigger>
            <TabsTrigger value="wardrobe">My Wardrobe</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Trip Details
                  </CardTitle>
                  <CardDescription>Plan your Australian adventure outfit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Destination</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Sydney Opera House, Uluru, Great Barrier Reef..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Destination Photo (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      {uploadedImage ? (
                        <div className="space-y-2">
                          <img
                            src={uploadedImage || "/placeholder.svg"}
                            alt="Destination"
                            className="w-full h-32 object-cover rounded"
                          />
                          {extractedColors.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">Extracted colors:</span>
                              {extractedColors.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Upload destination photo for color extraction
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <Button variant="outline" size="sm" asChild>
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Photo
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Activity Type</Label>
                      <Select value={activityType} onValueChange={setActivityType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beach">Beach Day</SelectItem>
                          <SelectItem value="hiking">Hiking/Bushwalking</SelectItem>
                          <SelectItem value="city">City Exploration</SelectItem>
                          <SelectItem value="adventure">Adventure Sports</SelectItem>
                          <SelectItem value="wildlife">Wildlife Watching</SelectItem>
                          <SelectItem value="photography">Photography Tour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Style Preference</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculine</SelectItem>
                          <SelectItem value="female">Feminine</SelectItem>
                          <SelectItem value="unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Choose Season Style</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {australianSeasons.map((style) => (
                        <Card
                          key={style.id}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            selectedStyle.id === style.id ? "ring-2 ring-primary bg-accent/20" : "hover:bg-accent/10"
                          }`}
                          onClick={() => setSelectedStyle(style)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              {style.icon}
                              <span className="font-medium text-sm text-card-foreground">{style.name}</span>
                            </div>
                            <p className="text-xs text-card-foreground/70 mb-2">{style.description}</p>
                            <div className="flex gap-1">
                              {style.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={generateOutfitAdvice}
                    disabled={!location.trim() || isGenerating || isLoadingWeather}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {isGenerating || isLoadingWeather ? (
                      <>
                        <Palette className="w-4 h-4 mr-2 animate-spin" />
                        {isLoadingWeather ? "Getting Weather..." : "Analyzing Colors..."}
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4 mr-2" />
                        Generate Outfit Guide
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Your Outfit Guide
                  </CardTitle>
                  <CardDescription>Personalized styling advice for your Australian adventure</CardDescription>
                </CardHeader>
                <CardContent>
                  {outfitAdvice ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {selectedStyle.name}
                        </Badge>
                        {realWeatherData && (
                          <Badge variant="outline" className="text-xs">
                            <Cloud className="w-3 h-3 mr-1" />
                            Live: {realWeatherData.main.temp}°C, {realWeatherData.weather[0].main}
                          </Badge>
                        )}
                        {isLoadingWeather && (
                          <Badge variant="outline" className="text-xs">
                            <Cloud className="w-3 h-3 mr-1 animate-pulse" />
                            Loading weather...
                          </Badge>
                        )}
                      </div>

                      {/* Visual palette chips */}
                      {advicePalette.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">Palette:</span>
                          {advicePalette.map((c, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      )}

                      <Textarea
                        value={outfitAdvice}
                        onChange={(e) => setOutfitAdvice(e.target.value)}
                        className="min-h-[400px] bg-input border-border resize-none"
                        placeholder="Your outfit guide will appear here..."
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(outfitAdvice)}>
                          Copy Guide
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOutfitAdvice("")
                            setAdvicePalette([])
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      <div className="text-center">
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Enter your destination and preferences to get your personalized outfit guide</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" />
                  My Wardrobe
                </CardTitle>
                <CardDescription>Manage your clothing items for personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Select value={newItem.type} onValueChange={(value) => setNewItem({ ...newItem, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Top">Top</SelectItem>
                      <SelectItem value="Bottom">Bottom</SelectItem>
                      <SelectItem value="Shoes">Shoes</SelectItem>
                      <SelectItem value="Accessory">Accessory</SelectItem>
                      <SelectItem value="Outerwear">Outerwear</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    type="color"
                    value={newItem.color}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                    className="w-full h-10 rounded border border-input"
                  />
                  <Button onClick={addWardrobeItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {wardrobeItems.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-3">
                        {item.image && (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-24 object-cover rounded-md"
                          />
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.type}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeWardrobeItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  Popular Australian Destinations
                </CardTitle>
                <CardDescription>Discover outfit inspiration for iconic Australian locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularDestinations.map((dest) => (
                    <Card
                      key={dest.name}
                      className="cursor-pointer hover:bg-accent/5 transition-colors overflow-hidden"
                      onClick={() => setLocation(dest.name)}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={destinationImages[dest.name as keyof typeof destinationImages] || "/placeholder.svg"}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-2 left-2 text-white">
                          <p className="font-medium text-sm">{dest.name}</p>
                          <p className="text-xs opacity-90">{dest.type}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {dest.icon}
                          <div>
                            <p className="font-medium">{dest.name}</p>
                            <p className="text-sm text-muted-foreground">{dest.type}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12 text-muted-foreground">
          <p className="text-sm">
            Inspired by Australia's diverse landscapes • Color harmony with nature • Adventure-ready styling
          </p>
        </div>
      </div>
    </div>
  )
}

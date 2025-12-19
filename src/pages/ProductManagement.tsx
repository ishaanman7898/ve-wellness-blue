import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Product, ProductInsert, ProductUpdate } from '@/lib/supabase'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trash2, Edit, Plus, Image as ImageIcon, LayoutGrid, List, Search, X, ArrowUpDown, MoveUp, MoveDown } from 'lucide-react'

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'inventory'>('products')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [manualOrders, setManualOrders] = useState<Record<string, Product[]>>({})
  const [specKeys, setSpecKeys] = useState<string[]>([])

  // Session management - auto logout after 30 minutes of inactivity
  React.useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const resetTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        toast.error('Session expired due to inactivity')
        window.location.href = '/login'
      }, 30 * 60 * 1000) // 30 minutes
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, resetTimeout))
    resetTimeout()

    return () => {
      clearTimeout(timeout)
      events.forEach(event => window.removeEventListener(event, resetTimeout))
    }
  }, [])

  const queryClient = useQueryClient()

  // Form state
  const [formData, setFormData] = useState<ProductInsert>({
    name: '',
    description: '',
    category: 'Accessories',
    status: 'In Store',
    sku: '',
    price: 0,
    buy_link: '',
    image_url: '',
    group_name: '',
    color: '',
    hex_color: '',
    specifications: {}
  })

  const updateVariantOrderMutation = useMutation({
    mutationFn: async ({ updates }: { updates: Array<{ id: string; variant_order: number | null }> }) => {
      const results = await Promise.all(
        updates.map(({ id, variant_order }) =>
          supabase
            .from('products')
            .update({ variant_order })
            .eq('id', id)
            .select('id')
        )
      )

      const firstError = results.find(r => r.error)?.error
      if (firstError) throw firstError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Variant order saved!')
    },
    onError: (error) => {
      toast.error(`Error saving variant order: ${error.message}`)
    }
  })

  // Fetch products with realtime
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Product[]
    }
  })

  // Fetch inventory
  const { data: inventory = [], isLoading: inventoryLoading, error: inventoryError } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Product[]
    }
  })

  // Realtime subscription for products
  React.useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Realtime update:', payload)
          queryClient.invalidateQueries({ queryKey: ['products'] })
          
          if (payload.eventType === 'INSERT') {
            toast.success('New product added!')
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Product updated!')
          } else if (payload.eventType === 'DELETE') {
            toast.info('Product deleted!')
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  // Realtime subscription for inventory
  React.useEffect(() => {
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          console.log('Realtime inventory update:', payload)
          queryClient.invalidateQueries({ queryKey: ['inventory'] })
          
          if (payload.eventType === 'INSERT') {
            toast.success('New inventory item added!')
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Inventory updated!')
          } else if (payload.eventType === 'DELETE') {
            toast.info('Inventory item deleted!')
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  // Create product mutation (only for products table)
  const createProductMutation = useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
      
      if (error) throw error
      return data?.[0] || null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully!')
      resetForm()
      setIsCreateModalOpen(false)
      setIsEditorOpen(false)
    },
    onError: (error) => {
      toast.error(`Error creating product: ${error.message}`)
    }
  })

  // Update mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...product }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
      
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Update failed: 0 rows updated (check RLS policies and that the product id exists).')
      }
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully!')
      setEditingProduct(null)
      setIsEditModalOpen(false)
      setIsCreateModalOpen(false)
      setIsEditorOpen(false)
    },
    onError: (error) => {
      toast.error(`Error updating product: ${error.message}`)
    }
  })

  // Delete mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully!')
    },
    onError: (error) => {
      toast.error(`Error deleting: ${error.message}`)
    }
  })

  // Compress image before upload
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Max dimensions
          const maxWidth = 1200
          const maxHeight = 1200
          
          let width = img.width
          let height = img.height
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            0.8
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Handle image upload with SKU-based naming and compression
  const getProductImageUrl = (sku: string): string => {
    const fileName = `${sku}.jpg`
    const { data: { publicUrl } } = supabase.storage
      .from('email-product-pictures')
      .getPublicUrl(fileName)
    return publicUrl
  }

  const handleImageUpload = async (file: File, sku: string): Promise<string | null> => {
    try {
      toast.info('Compressing image...')
      
      // Compress the image
      const compressedBlob = await compressImage(file)
      const originalSize = (file.size / 1024).toFixed(2)
      const compressedSize = (compressedBlob.size / 1024).toFixed(2)
      const savings = (((file.size - compressedBlob.size) / file.size) * 100).toFixed(1)
      
      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${savings}% reduction)`)
      
      // Use SKU as filename with .jpg extension
      const fileName = `${sku}.jpg`

      console.log('Uploading file to email-product-pictures:', fileName)
      
      toast.info('Uploading to Supabase...')
      
      const { error: uploadError } = await supabase.storage
        .from('email-product-pictures')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const publicUrl = getProductImageUrl(sku)

      console.log('Public URL:', publicUrl)
      toast.success(`Image uploaded! Saved ${savings}% space. URL will update in 2 minutes.`)
      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image: ' + (error as Error).message)
      return null
    }
  }

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Accessories',
      status: 'In Store',
      sku: '',
      price: 0,
      buy_link: '',
      image_url: '',
      group_name: '',
      color: '',
      hex_color: '',
      specifications: {}
    })
    setImageFile(null)
    setImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate SKU is provided
    if (!formData.sku) {
      toast.error('SKU is required for image upload')
      return
    }
    
    let imageUrl = formData.image_url
    
    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile, formData.sku)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      } else {
        // If upload failed, don't proceed
        return
      }
    }

    const productData = { 
      ...formData, 
      image_url: imageUrl,
      specifications: formData.specifications || {}
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productData })
    } else {
      createProductMutation.mutate(productData)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      status: product.status || 'In Store',
      sku: product.sku,
      price: product.price,
      buy_link: product.buy_link || '',
      image_url: product.image_url || '',
      group_name: product.group_name || '',
      color: product.color || '',
      hex_color: product.hex_color || '',
      specifications: product.specifications || {}
    })
    setImagePreview(product.image_url || '')
    setIsCreateModalOpen(true)
  }

  const openSideEditor = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      status: product.status || 'In Store',
      sku: product.sku,
      price: product.price,
      buy_link: product.buy_link || '',
      image_url: product.image_url || '',
      group_name: product.group_name || '',
      color: product.color || '',
      hex_color: product.hex_color || '',
      specifications: product.specifications || {}
    })
    setImagePreview(product.image_url || '')
    setIsEditorOpen(true)
  }

  const closeSideEditor = () => {
    setIsEditorOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredProducts = useMemo(() => {
    // Only show products, not inventory
    const base = selectedCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedCategory)

    if (!searchTerm.trim()) return base
    const term = searchTerm.toLowerCase()
    return base.filter((p) => {
      const haystack = [
        p.name,
        p.sku,
        p.category,
        p.group_name || '',
        p.color || '',
        p.status || ''
      ].join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [products, searchTerm, selectedCategory])

  // Group products by group_name for better organization
  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: Product[] } = {}
    filteredProducts.forEach(product => {
      const groupName = product.group_name || product.name
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(product)
    })

    // Always sort by manual order (variant_order)
    Object.keys(groups).forEach(groupName => {
      if (manualOrders[groupName]?.length) {
        groups[groupName] = manualOrders[groupName]
        return
      }

      groups[groupName].sort((a, b) => {
        const aOrder = a.variant_order ?? Number.POSITIVE_INFINITY
        const bOrder = b.variant_order ?? Number.POSITIVE_INFINITY
        return aOrder - bOrder
      })
    })

    return groups
  }, [filteredProducts, manualOrders])

  const reorderGroup = (groupName: string, targetId: string) => {
    if (!draggingId || draggingId === targetId) return null

    const current = manualOrders[groupName] ?? groupedProducts[groupName]
    if (!current) return null

    const fromIndex = current.findIndex(p => p.id === draggingId)
    const toIndex = current.findIndex(p => p.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return null

    const next = [...current]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setManualOrders(prev => ({ ...prev, [groupName]: next }))
    return next
  }

  const saveGroupOrder = (groupName: string, listOverride?: Product[]) => {
    const list = listOverride ?? manualOrders[groupName]
    if (!list?.length) return

    updateVariantOrderMutation.mutate({
      updates: list.map((p, idx) => ({ id: p.id, variant_order: idx }))
    })
  }

  const reorderGroupAndPersist = (groupName: string, targetId: string) => {
    const next = reorderGroup(groupName, targetId)
    if (next) {
      saveGroupOrder(groupName, next)
    }
  }

  const moveVariant = (groupName: string, productId: string, direction: 'up' | 'down') => {
    const current = manualOrders[groupName] ?? groupedProducts[groupName]
    if (!current) return

    const index = current.findIndex(p => p.id === productId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= current.length) return

    const next = [...current]
    const [moved] = next.splice(index, 1)
    next.splice(newIndex, 0, moved)

    setManualOrders(prev => ({ ...prev, [groupName]: next }))
    saveGroupOrder(groupName, next)
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error loading products</h2>
          <p className="text-red-600">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-8 pt-52 pb-20 flex-grow">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
            Product <span className="text-glacier">Management</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-500">Live</span>
            </div>
          </h1>
          <p className="text-muted-foreground">Manage products, variants, and specifications with realtime updates</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          {activeTab === 'products' && (
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={(open) => {
                setIsCreateModalOpen(open)
                if (!open) {
                  setEditingProduct(null)
                  resetForm()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="category">Category</Label>
                    {formData.category === 'Wellness' && (
                      <a 
                        href="/shop/supplements" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-glacier hover:underline"
                      >
                        View Supplements →
                      </a>
                    )}
                  </div>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                      <SelectItem value="Wellness">Wellness (Supplements)</SelectItem>
                      <SelectItem value="Water Bottles">Water Bottles</SelectItem>
                      <SelectItem value="Bundles">Bundles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Store">In Store</SelectItem>
                      <SelectItem value="Removal Requested">Removal Requested</SelectItem>
                      <SelectItem value="Removal Pending">Removal Pending</SelectItem>
                      <SelectItem value="Phased Out">Phased Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="group_name">Group Name</Label>
                  <Input
                    id="group_name"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color/Variant</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hex_color">Hex Color</Label>
                  <Input
                    id="hex_color"
                    value={formData.hex_color}
                    onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
                <div>
                  <Label htmlFor="buy_link">Buy Link</Label>
                  <Input
                    id="buy_link"
                    value={formData.buy_link}
                    onChange={(e) => setFormData({ ...formData, buy_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Product Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <div className="w-16 h-16 border rounded overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications Editor */}
              <div>
                <Label>Specifications</Label>
                <div className="space-y-2 mt-2">
                  {formData.specifications && Object.entries(formData.specifications).map(([key, value], index) => {
                    const specKey = `spec-item-${index}`
                    return (
                      <div key={specKey} className="flex gap-2">
                        <Input
                          placeholder="Specification name (e.g., capacity, material)"
                          value={key}
                          onChange={(e) => {
                            const newSpecs = { ...formData.specifications }
                            const oldKey = key
                            const newKey = e.target.value
                            if (oldKey !== newKey) {
                              delete newSpecs[oldKey]
                              newSpecs[newKey] = value
                            }
                            setFormData({ ...formData, specifications: newSpecs })
                          }}
                          className="flex-1"
                          autoComplete="off"
                        />
                        <Input
                          placeholder="Value (e.g., 40 oz, Stainless Steel)"
                          value={Array.isArray(value) ? value.join(', ') : String(value)}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              specifications: { ...formData.specifications, [key]: e.target.value }
                            })
                          }}
                          className="flex-1"
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSpecs = { ...formData.specifications }
                            delete newSpecs[key]
                            setFormData({ ...formData, specifications: newSpecs })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          ['']: ''
                        }
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specification
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    editingProduct
                      ? updateProductMutation.isPending
                      : createProductMutation.isPending
                  }
                >
                  {editingProduct
                    ? (updateProductMutation.isPending ? 'Saving...' : 'Save Changes')
                    : (createProductMutation.isPending ? 'Creating...' : 'Create Product')}
                </Button>
              </div>
            </form>
          </DialogContent>
            </Dialog>
          )}
      </div>
      </div>

      {/* Table Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'products'
              ? 'border-glacier text-glacier'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Products Table
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'inventory'
              ? 'border-glacier text-glacier'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Inventory Table
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, SKU, category…"
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-border w-fit">
          <button
            type="button"
            onClick={() => { setViewMode('grid'); setIsEditorOpen(false); }}
            className={
              "px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 " +
              (viewMode === 'grid' ? 'bg-glacier text-white' : 'bg-muted hover:bg-muted/80')
            }
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={
              "px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 border-l border-border " +
              (viewMode === 'list' ? 'bg-glacier text-white' : 'bg-muted hover:bg-muted/80')
            }
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>


      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Inventory Overview</h2>
          {inventoryLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading inventory...</div>
          ) : inventoryError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error loading inventory: {(inventoryError as Error).message}</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No inventory items found.</div>
          ) : (
            <div className="grid gap-4">
              {inventory.map((item: any) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{item.item_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Bought: {item.stock_bought || 0}</p>
                      <p className="font-semibold">Left: {item.stock_left || 0}</p>
                    </div>
                    <Badge variant={
                      item.stock_left < 0 ? 'destructive' :
                      item.stock_left > 10 ? 'default' : 
                      item.stock_left > 0 ? 'secondary' : 
                      'destructive'
                    }>
                      {item.stock_left < 0 ? 'Backordered' : item.stock_left > 10 ? 'In Stock' : item.stock_left > 0 ? 'Low Stock' : 'Out of Stock'}
                    </Badge>
                  </div>

                </Card>
              ))}
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading products...</div>
      ) : Object.keys(groupedProducts).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No products found.</div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(groupedProducts).map(([groupName, productsInGroup]) => (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{groupName}</h2>
                <Badge variant="secondary">{productsInGroup.length} variants</Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={updateVariantOrderMutation.isPending}
                  onClick={() => saveGroupOrder(groupName)}
                  className="ml-auto"
                >
                  {updateVariantOrderMutation.isPending ? 'Saving…' : 'Save order'}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsInGroup.map((product, index) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                    <div className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold border">
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => openSideEditor(product)}
                      draggable
                      onDragStart={() => setDraggingId(product.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={(e) => {
                        e.preventDefault()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        reorderGroupAndPersist(groupName, product.id)
                      }}
                    >
                      <div className="aspect-square bg-muted/30 relative">
                        {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 ${
                      product.status === 'In Store' ? 'bg-green-500' :
                      product.status === 'Removal Requested' ? 'bg-red-500' :
                      product.status === 'Removal Pending' ? 'bg-orange-500' :
                      product.status === 'Phased Out' ? 'bg-gray-500' :
                      'bg-yellow-500'
                    }`}
                  >
                    {product.status}
                  </Badge>
                </div>
              </button>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">SKU: {product.sku}</p>
                  </div>
                  <span className="text-lg font-bold text-glacier">${product.price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.color && (
                    <div className="flex items-center gap-2">
                      {product.hex_color && (
                        <div
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: product.hex_color }}
                        />
                      )}
                      <span className="text-sm text-muted-foreground">{product.color}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(product)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(product.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedProducts).map(([groupName, productsInGroup]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{groupName}</h2>
                <Badge variant="secondary">{productsInGroup.length} variants</Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={updateVariantOrderMutation.isPending}
                  onClick={() => saveGroupOrder(groupName)}
                  className="ml-auto"
                >
                  {updateVariantOrderMutation.isPending ? 'Saving…' : 'Save order'}
                </Button>
              </div>
              <div className="space-y-2">
                {productsInGroup.map((product, index) => (
                  <Card key={product.id} className="p-4 group">
                    <div
                      className="flex items-center gap-4"
                      draggable
                      onDragStart={() => setDraggingId(product.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={(e) => {
                        e.preventDefault()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        reorderGroupAndPersist(groupName, product.id)
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-16 h-16 bg-muted/30 rounded-lg flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                              <Badge
                                className={`text-xs ${
                                  product.status === 'In Store' ? 'bg-green-500' :
                                  product.status === 'Removal Requested' ? 'bg-red-500' :
                                  product.status === 'Removal Pending' ? 'bg-orange-500' :
                                  product.status === 'Phased Out' ? 'bg-gray-500' :
                                  'bg-yellow-500'
                                }`}
                              >
                                {product.status}
                              </Badge>
                              {product.color && (
                                <div className="flex items-center gap-1">
                                  {product.hex_color && (
                                    <div
                                      className="w-3 h-3 rounded border border-border"
                                      style={{ backgroundColor: product.hex_color }}
                                    />
                                  )}
                                  <span className="text-xs text-muted-foreground">{product.color}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-glacier">${product.price.toFixed(2)}</div>
                            <div className="flex gap-1 mt-2">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveVariant(groupName, product.id, 'up')
                                  }}
                                  disabled={productsInGroup.findIndex(p => p.id === product.id) === 0}
                                >
                                  <MoveUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveVariant(groupName, product.id, 'down')
                                  }}
                                  disabled={productsInGroup.findIndex(p => p.id === product.id) === productsInGroup.length - 1}
                                >
                                  <MoveDown className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      <Footer />
    </div>
  )
}

export default ProductManagement

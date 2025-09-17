from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
import datetime
import json

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./ecommerce.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    category = Column(String)
    brand = Column(String)
    image_url = Column(String)
    specifications = Column(Text)  # JSON string
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    session_id = Column(String)  # For guest users
    
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    customer_email = Column(String)
    customer_phone = Column(String)
    shipping_address = Column(Text)
    total_amount = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float)
    
    order = relationship("Order")
    product = relationship("Product")

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    brand: str
    image_url: str
    specifications: str
    stock_quantity: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

class CartItemBase(BaseModel):
    product_id: int
    quantity: int
    session_id: str

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    product: ProductResponse
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str

class OrderCreate(OrderBase):
    cart_items: List[dict]

class OrderResponse(OrderBase):
    id: int
    total_amount: float
    status: str
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI(title="Computer E-commerce API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize sample data
def init_sample_data():
    db = SessionLocal()
    
    # Check if products already exist
    if db.query(Product).first():
        db.close()
        return
    
    sample_products = [
        {
            "name": "Gaming Laptop RTX 4070",
            "description": "High-performance gaming laptop with RTX 4070 graphics card, perfect for gaming and content creation.",
            "price": 1899.99,
            "category": "Laptops",
            "brand": "TechPro",
            "image_url": "/images/gaming-laptop-rtx4070.jpg",
            "specifications": json.dumps({
                "processor": "Intel Core i7-13700H",
                "graphics": "NVIDIA RTX 4070 8GB",
                "ram": "16GB DDR5",
                "storage": "1TB NVMe SSD",
                "display": "15.6\" 144Hz QHD",
                "weight": "2.3kg"
            }),
            "stock_quantity": 25
        },
        {
            "name": "Business Ultrabook",
            "description": "Lightweight and powerful ultrabook designed for business professionals and productivity.",
            "price": 1299.99,
            "category": "Laptops",
            "brand": "ProWork",
            "image_url": "/images/business-ultrabook.jpg",
            "specifications": json.dumps({
                "processor": "Intel Core i5-13500U",
                "graphics": "Intel Iris Xe",
                "ram": "16GB LPDDR5",
                "storage": "512GB NVMe SSD",
                "display": "14\" 2K IPS",
                "weight": "1.2kg"
            }),
            "stock_quantity": 40
        },
        {
            "name": "Gaming Desktop RTX 4080",
            "description": "Ultimate gaming desktop with RTX 4080 for 4K gaming and professional workloads.",
            "price": 2499.99,
            "category": "Desktops",
            "brand": "GameMax",
            "image_url": "/images/gaming-desktop-rtx4080.jpg",
            "specifications": json.dumps({
                "processor": "AMD Ryzen 7 7700X",
                "graphics": "NVIDIA RTX 4080 16GB",
                "ram": "32GB DDR5",
                "storage": "2TB NVMe SSD",
                "motherboard": "X670E Chipset",
                "psu": "850W 80+ Gold"
            }),
            "stock_quantity": 15
        },
        {
            "name": "Office Desktop",
            "description": "Reliable desktop computer for office work, web browsing, and light productivity tasks.",
            "price": 699.99,
            "category": "Desktops",
            "brand": "OfficePC",
            "image_url": "/images/office-desktop.jpg",
            "specifications": json.dumps({
                "processor": "Intel Core i3-13100",
                "graphics": "Intel UHD Graphics",
                "ram": "8GB DDR4",
                "storage": "256GB SSD + 1TB HDD",
                "motherboard": "B660 Chipset",
                "psu": "450W 80+ Bronze"
            }),
            "stock_quantity": 50
        },
        {
            "name": "Mechanical Gaming Keyboard",
            "description": "RGB mechanical keyboard with Cherry MX switches, perfect for gaming and typing.",
            "price": 149.99,
            "category": "Accessories",
            "brand": "KeyMaster",
            "image_url": "/images/mechanical-keyboard.jpg",
            "specifications": json.dumps({
                "switches": "Cherry MX Red",
                "backlight": "RGB per-key",
                "connectivity": "USB-C + Wireless",
                "battery": "4000mAh",
                "layout": "Full-size 104 keys"
            }),
            "stock_quantity": 100
        },
        {
            "name": "Gaming Mouse Pro",
            "description": "High-precision gaming mouse with customizable DPI and programmable buttons.",
            "price": 79.99,
            "category": "Accessories",
            "brand": "MouseTech",
            "image_url": "/images/gaming-mouse.jpg",
            "specifications": json.dumps({
                "sensor": "PixArt 3395",
                "dpi": "Up to 26,000 DPI",
                "buttons": "8 programmable buttons",
                "connectivity": "USB + Wireless",
                "battery": "70 hours"
            }),
            "stock_quantity": 75
        },
        {
            "name": "4K Gaming Monitor",
            "description": "27-inch 4K gaming monitor with 144Hz refresh rate and HDR support.",
            "price": 599.99,
            "category": "Monitors",
            "brand": "ViewMax",
            "image_url": "/images/4k-gaming-monitor.jpg",
            "specifications": json.dumps({
                "size": "27 inches",
                "resolution": "3840x2160 (4K)",
                "refresh_rate": "144Hz",
                "panel": "IPS",
                "hdr": "HDR10",
                "connectivity": "HDMI 2.1, DisplayPort 1.4, USB-C"
            }),
            "stock_quantity": 30
        },
        {
            "name": "Graphics Card RTX 4060",
            "description": "Mid-range graphics card perfect for 1440p gaming and content creation.",
            "price": 399.99,
            "category": "Components",
            "brand": "GraphicsMax",
            "image_url": "/images/rtx4060.jpg",
            "specifications": json.dumps({
                "gpu": "NVIDIA GeForce RTX 4060",
                "memory": "8GB GDDR6",
                "base_clock": "1830 MHz",
                "boost_clock": "2460 MHz",
                "power": "115W TGP",
                "outputs": "3x DisplayPort 1.4a, 1x HDMI 2.1"
            }),
            "stock_quantity": 20
        }
    ]
    
    for product_data in sample_products:
        product = Product(**product_data)
        db.add(product)
    
    db.commit()
    db.close()

# Initialize sample data on startup
init_sample_data()

# API Routes
@app.get("/")
async def root():
    return {"message": "Computer E-commerce API", "version": "1.0.0"}

@app.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    if category:
        query = query.filter(Product.category == category)
    if brand:
        query = query.filter(Product.brand == brand)
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    
    return query.all()

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Product.category).distinct().all()
    return [cat[0] for cat in categories]

@app.get("/brands")
async def get_brands(db: Session = Depends(get_db)):
    brands = db.query(Product.brand).distinct().all()
    return [brand[0] for brand in brands]

@app.post("/cart", response_model=CartItemResponse)
async def add_to_cart(cart_item: CartItemCreate, db: Session = Depends(get_db)):
    # Check if product exists
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.product_id == cart_item.product_id,
        CartItem.session_id == cart_item.session_id
    ).first()
    
    if existing_item:
        existing_item.quantity += cart_item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        db_cart_item = CartItem(**cart_item.dict())
        db.add(db_cart_item)
        db.commit()
        db.refresh(db_cart_item)
        return db_cart_item

@app.get("/cart/{session_id}", response_model=List[CartItemResponse])
async def get_cart(session_id: str, db: Session = Depends(get_db)):
    cart_items = db.query(CartItem).filter(CartItem.session_id == session_id).all()
    return cart_items

@app.put("/cart/{cart_item_id}")
async def update_cart_item(cart_item_id: int, quantity: int, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = quantity
    
    db.commit()
    return {"message": "Cart updated successfully"}

@app.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

@app.post("/orders", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Calculate total amount
    total_amount = 0
    for item in order.cart_items:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        if product:
            total_amount += product.price * item["quantity"]
    
    # Create order
    db_order = Order(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        total_amount=total_amount
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item in order.cart_items:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        if product:
            order_item = OrderItem(
                order_id=db_order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=product.price
            )
            db.add(order_item)
    
    db.commit()
    return db_order

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


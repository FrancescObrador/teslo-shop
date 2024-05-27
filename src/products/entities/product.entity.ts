import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: 'ef3165ff-7d36-4a7c-8fc5-f2eea32d1d5d',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ApiProperty({
        example: 'T-shirt Teslo',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string

    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('numeric',{
        default: 0
    }
    )
    price: number

    @ApiProperty({
        example: 'anim reprehendrit nulla in anim minim irure commodo.',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',   
    nullable: true    
    })
    description: string

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 10
    })
    @Column('int', {
        default: 0
    })
    stock: number

    @ApiProperty({
        example: ['M', 'L', 'XL', 'XXL'],
        description: 'Product sizes',
        uniqueItems: true
    })
    @Column('text',{
        array: true
    })
    sizes: string[]

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string

    @ApiProperty({
        example: ['tesla', 'funny'],
        description: 'Product tags',
    })
    @Column('text',{
        array: true,
        default: []
    })
    tags: string[]
    
    @ApiProperty({
        example: ['http://img.png', 'http://img2.jpg'],
        description: 'Product images',
    })
    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?:ProductImage[]

    @ManyToOne(
        ()=> User,
        (user) => user.product,
        {eager: true}
    )
    user: User


    @BeforeInsert()
    checkSlugInsert(){
        if(!this.slug){
            this.slug = this.title
        }
        
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", "")
    }

    @BeforeUpdate()
    chechSlugUpdate(){
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", "")
    }
}

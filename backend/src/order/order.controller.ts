import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OrderDto, OrderResult } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() order: OrderDto): Promise<OrderResult> {
    return this.orderService.create(order);
  }
}

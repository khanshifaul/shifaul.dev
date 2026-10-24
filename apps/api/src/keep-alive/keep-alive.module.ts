import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KeepAliveService } from './keep-alive.service';

@Module({
  imports: [HttpModule],
  providers: [KeepAliveService],
  exports: [KeepAliveService],
})
export class KeepAliveModule {}

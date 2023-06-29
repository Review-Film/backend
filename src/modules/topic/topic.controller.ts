import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateTopicDTO, SearchTopicDTO, UpdateTopicDTO } from './dto';
import JwtAuthGuard from '../auth/guard/jwtAuth.guard';
import { SortOptionEnum } from '../../configs/constants/common';

@Controller('topic')
@ApiTags('Topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('/topics')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'topicIds', required: false, type: [Number] })
  @ApiQuery({
    name: 'sortByPriority',
    enum: SortOptionEnum,
    required: false,
    type: String,
  })
  async getTopics(@Query() query: SearchTopicDTO) {
    return this.topicService.getTopics(query);
  }

  @Get('/topics/:topicUrl')
  @ApiParam({
    name: 'topicUrl',
    required: true,
    type: String,
  })
  async getTopicByUrl(@Req() request, @Param('topicUrl') topicUrl: string) {
    return this.topicService.getTopicByUrl(topicUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/admin/topics')
  @ApiBody({ type: CreateTopicDTO })
  async createTopic(@Req() request, @Body() data: CreateTopicDTO) {
    return this.topicService.createTopic(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/admin/topics/:topicId')
  @ApiParam({
    name: 'topicId',
    required: true,
    type: Number,
  })
  @ApiBody({ type: UpdateTopicDTO })
  async updateTopic(
    @Req() request,
    @Body() data: UpdateTopicDTO,
    @Param('topicId') topicId: number,
  ) {
    return this.topicService.updateTopic(topicId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/admin/topics/:topicId')
  @ApiParam({
    name: 'topicId',
    required: true,
    type: Number,
  })
  async deleteTopic(@Req() request, @Param('topicId') topicId: number) {
    return this.topicService.deleteTopic(topicId);
  }
}

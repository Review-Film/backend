import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User, Roles, Topic } from 'src/entities';
import { In, Repository } from 'typeorm';
import { CreateTopicDTO, SearchTopicDTO, UpdateTopicDTO } from './dto';
import { calculatePaginate } from '../../utils/pagination';
import slugify from 'slugify';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async getTopics(query: SearchTopicDTO) {
    const { topicIds, page, perPage, sortByPriority } = query;
    const { limit, skip, currentPage } = calculatePaginate(page, perPage);

    const queryBuilder = this.topicRepository.createQueryBuilder('topic');

    if (topicIds?.length > 0) {
      queryBuilder.where('topic.id IN (:topicIds)', { topicIds });
    }

    queryBuilder.skip(skip).take(limit);

    const [topics, count] = await queryBuilder
      .orderBy('topic.priority', sortByPriority ?? 'ASC')
      .getManyAndCount();

    return {
      topics,
      meta: {
        total: count,
        page: currentPage,
        perPage: limit,
      },
    };
  }

  async getTopicByUrl(topicUrl: string) {
    return await this.topicRepository.findOne({
      where: {
        url: topicUrl,
      },
    });
  }

  async createTopic(data: CreateTopicDTO) {
    try {
      const { name, priority } = data;
      const url = slugify(name, {
        replacement: '-', // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
        locale: 'vi', // language code of the locale to use
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      });

      const newTopic = new Topic();
      newTopic.url = url;
      newTopic.name = name;
      newTopic.priority = priority ?? 1;

      await this.topicRepository.save(newTopic);

      return newTopic;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'Topic with that url already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateTopic(topicId: number, data: UpdateTopicDTO) {
    try {
      const updatedTopic = await this.topicRepository.findOne({
        where: { id: topicId },
      });

      if (!updatedTopic) {
        throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
      }

      Object.keys(data).map((key) => {
        if (key === 'name') {
          const url = slugify(data[key], {
            replacement: '-', // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true, // convert to lower case, defaults to `false`
            strict: true, // strip special characters except replacement, defaults to `false`
            locale: 'vi', // language code of the locale to use
            trim: true, // trim leading and trailing replacement chars, defaults to `true`
          });
          updatedTopic['url'] = url;
        }
        updatedTopic[key] = data[key];
      });
      await this.topicRepository.save(updatedTopic);

      return updatedTopic;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'Topic with that url already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteTopic(topicId: number) {
    await this.topicRepository.delete(topicId);
  }
}

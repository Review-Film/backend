import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';

// Entity
import { Article, User } from 'src/entities/';

// DTO
import {
  CreateArticleDTO,
  SearchArticleDTO,
  SearchArticleForAdminDTO,
  UpdateArticleDTO,
} from './dto';

// Service
import { ArticleSearchService } from './articleSearch.service';
import { calculatePaginate } from 'src/utils/pagination';
import slugify from 'slugify';
import { TopicService } from '../topic/topic.service';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';

@Injectable()
export class ArticleService {
  index = 'articles';
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,

    private articleSearchService: ArticleSearchService,
    private topicService: TopicService,
  ) {}

  async createArticle(article: CreateArticleDTO, user: User) {
    try {
      const url = slugify(article.title, {
        replacement: '-', // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
        locale: 'vi', // language code of the locale to use
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      });
      const { topics } = await this.topicService.getTopics({ perPage: 100 });
      const newArticle = this.articleRepo.create({
        ...article,
        url,
        topics: topics,
        createdBy: user,
        timeToRead: '10min',
      });

      await this.articleRepo.save(newArticle);
      this.articleSearchService.indexArticle(newArticle);

      return newArticle;
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

  async getArticles(searchQuery: SearchArticleDTO) {
    const { page, perPage, sortByDate, topicUrls } = searchQuery;
    const { limit, skip, currentPage } = calculatePaginate(page, perPage);

    const queryBuilder = this.articleRepo
      .createQueryBuilder('article')
      .where(
        'article.visibility = :visibility AND article.deleteSoft = :deleteSoft',
        { visibility: 'public', deleteSoft: false },
      )
      .leftJoinAndSelect('article.createdBy', 'user')
      .leftJoinAndSelect('article.topics', 'topic');

    const seletedFields = [
      'article.id',
      'article.url',
      'article.title',
      'article.description',
      'article.image',
      'article.timeToRead',
      'article.createdAt',
      'user.id',
      'user.name',
      'topic.id',
      'topic.name',
      'topic.url',
    ];

    // Search by text
    if (searchQuery.textSearch) {
      const results = await this.articleSearchService.search(searchQuery);
      const ids = results?.map((result) => result.id);
      if (ids?.length > 0) {
        queryBuilder.andWhere('article.id IN (:...ids)', { ids });
      }
    }

    // Search by topicUrls
    if (topicUrls?.length > 0) {
      queryBuilder.andWhere('topic.url IN (:...topicUrls)', { topicUrls });
    }

    const [articles, count] = await queryBuilder
      .orderBy('article.createdAt', sortByDate ?? 'ASC')
      .skip(skip)
      .take(limit)
      .select(seletedFields)
      .getManyAndCount();

    return {
      articles,
      meta: {
        total: count,
        page: currentPage,
        perPage: limit,
      },
    };
  }

  async getArticlesForAdmin(searchQuery: SearchArticleForAdminDTO) {
    const { page, perPage, sortByDate, topicUrls, visibilities, deleteSoft } =
      searchQuery;
    const { limit, skip, currentPage } = calculatePaginate(page, perPage);

    const queryBuilder = this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.createdBy', 'user');
    let seletedFields = [
      'article.id',
      'article.url',
      'article.title',
      'article.description',
      'article.image',
      'article.timeToRead',
      'article.createdAt',
      'user.id',
      'user.name',
    ];

    // Search by text
    if (searchQuery.textSearch) {
      const results = await this.articleSearchService.search(searchQuery);
      const ids = results?.map((result) => result.id);
      if (ids?.length > 0) {
        queryBuilder.andWhere('article.id IN (:...ids)', { ids });
      }
    }

    // Search by visibilities
    if (visibilities?.length > 0) {
      queryBuilder.andWhere('article.visibility IN (:...visibilities)', {
        visibilities,
      });
    }

    // Search by deleteSoft
    if (deleteSoft) {
      queryBuilder.andWhere('article.deleteSoft = :deleteSoft', {
        deleteSoft,
      });
    }

    // Search by topicUrls
    if (topicUrls?.length > 0) {
      queryBuilder
        .leftJoinAndSelect('article.topics', 'topic')
        .andWhere('topic.url IN (:...topicUrls)', { topicUrls });

      seletedFields = seletedFields.concat([
        'topic.id',
        'topic.name',
        'topic.url',
      ]);
    }

    const [articles, count] = await queryBuilder
      .orderBy('article.createdAt', sortByDate ?? 'ASC')
      .skip(skip)
      .take(limit)
      .select(seletedFields)
      .getManyAndCount();

    return {
      articles,
      meta: {
        total: count,
        page: currentPage,
        perPage: limit,
      },
    };
  }

  async getArticleByUrl(articleUrl: string) {
    const article = await this.articleRepo
      .createQueryBuilder('article')
      .where('article.url = :articleUrl', { articleUrl })
      .andWhere(
        new Brackets((qb) => {
          qb.where('article.visibility = :public', {
            public: 'public',
          }).orWhere('article.visibility = :withLink', {
            withLink: 'withLink',
          });
        }),
      )
      .leftJoinAndSelect('article.topics', 'topic')
      .getOne();

    return article;
  }

  async updateArticle(user: User, articleId: number, data: UpdateArticleDTO) {
    try {
      const updatedArticle = await this.articleRepo.findOne({
        where: { id: articleId },
        relations: ['createdBy', 'topics'],
      });
      if (updatedArticle?.createdBy?.id !== user.id) {
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
          updatedArticle['url'] = url;
        }
        updatedArticle[key] = data[key];
      });
      this.articleRepo.save(updatedArticle);

      return updatedArticle;
    } catch (error) {
      console.log(error);
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

  async deleteArticle(user: User, articleId: number) {
    const updatedArticle = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['createdBy'],
    });

    if (updatedArticle.createdBy.id !== user.id) {
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
    }

    await this.articleRepo.update(articleId, { deleteSoft: true });
    await this.articleSearchService.remove(articleId);
  }
}

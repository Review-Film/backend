import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

// Entity
import { Role, User, Article, Topic } from '../../entities';
import { ArticleSearchService } from '../article/articleSearch.service';
import slugify from 'slugify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
  constructor(
    private readonly logger: Logger,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Article)
    private articleRepo: Repository<Article>,

    @InjectRepository(Topic)
    private topicRepo: Repository<Topic>,

    private articleSearchService: ArticleSearchService,

    private configService: ConfigService,
  ) {}

  async seed() {
    if (this.configService.get('NODE_ENV') === 'production') {
      await this.seedAdmin();
    } else {
      await this.clearDatabase();
      const users = await this.seedUsers();
      await this.seedArticles(users);
    }
  }

  async clearDatabase() {
    // Delete all topic
    const deleteTopic = this.topicRepo.delete({});
    // Delete all article
    const deleteArticle = this.articleRepo.delete({});

    await Promise.all([deleteArticle, deleteTopic]);

    // Delete all role
    const deleteRole = this.roleRepo.delete({});
    // Detele all user
    const deleteUser = this.userRepo.delete({});

    await Promise.all([deleteRole, deleteUser]);
  }

  async seedAdmin() {
    try {
      // Create new role
      const roleAdmin = new Role();
      roleAdmin.name = 'admin';
      await this.roleRepo.save(roleAdmin);
      this.logger.debug('Successfuly completed seeding roles...');

      // Create new user
      const email = this.configService.get('ADMIN_EMAIL');
      const password = this.configService.get('ADMIN_PASSWORD');
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User();

      user.name = 'Admin';
      user.email = email;
      user.roles = [roleAdmin];
      user.password = hashedPassword;

      await this.userRepo.save(user);

      this.logger.debug('Successfuly completed seeding users...');
    } catch (error) {
      console.log(error);
      this.logger.error('Failed seeding users...');
    }
  }

  async seedUsers(): Promise<User[]> {
    try {
      // Create new role
      const role1 = new Role();
      role1.name = 'admin';
      const role2 = new Role();
      role2.name = 'member';
      const role3 = new Role();
      role3.name = 'systemadmin';
      const roles = await Promise.all([
        this.roleRepo.save(role1),
        this.roleRepo.save(role2),
        this.roleRepo.save(role3),
      ]);
      this.logger.debug('Successfuly completed seeding roles...');

      // Create new user
      let users = [];
      const hashedPassword = await bcrypt.hash('123456', 10);
      roles.forEach((role) => {
        const user = new User();

        user.name = faker.name.findName();
        user.email = faker.internet.email();
        user.roles = [role];
        user.password = hashedPassword;

        users.push(this.userRepo.save(user));
      });

      users = await Promise.all(users);
      this.logger.debug('Successfuly completed seeding users...');

      return users;
    } catch (error) {
      console.log(error);
      this.logger.error('Failed seeding users...');
    }
  }

  async seedArticles(users: User[]) {
    try {
      // Seed topics
      let topics = [];
      [1, 2].map((item) => {
        const topic = new Topic();
        topic.name = 'Topic ' + item;
        topic.url = 'topic' + item;
        topics.push(this.topicRepo.save(topic));
      });
      topics = await Promise.all(topics);

      // Seed articles
      let articles = [];
      users.forEach((user) => {
        [1, 2].map((item) => {
          const mkdStr = `
          # 1. Higher-order function (HOF) là gì?
Trong Javascript, các function được coi như một giá trị, do đó chúng có thể được gán như một tham số hoặc là một giá trị được trả về của một function khác. Việc làm trên được gọi là sử dụng higher-order function.

Dưới đây là các ví dụ ứng dụng 2 loại triển khai HOF:
* Truyền một function làm tham số của một function khác
* Trả về function từ một function khác

# 2. Truyền một function làm tham số
Ví dụ về chức năng lọc các phần tử chẵn trong mảng. Hàm **isEven** là một HOF và được sự dụng làm tham số của hàm **filter**

\`\`\`javascript
const filter = (arr, fn) => {
    return arr.filter(fn);
};

const isEven = num => {
    return num % 2 === 0;
};

const evenNumbers = filter([1, 2, 3], isEven);
console.log(evenNumbers); // [2]
\`\`\`
# 3. Trả về một function từ một function khác
**Case 1: Phân quyền trong NodeJS**

Dưới đây là đoạn code phân quyền API của mình, lúc này mình chưa biết đến khái niệm higher-order function, do đó code của mình khá khó hiểu cho người mới vào dự án.
\`\`\`javascript:user.route.js
const API_PERMISSION = {
	'/api/user': 'admin'
}

const authRolePermission = (user, role) => {
    if (user?.role !== role) {
        throw {
            message: "Not permission"
        }
    }
};

// Chưa sử dụng higher-order function
const auth = (req, res, next) => {
    try {
        authRolePermission(req.user, API_PERMISSION[req.baseUrl])

        next(); 
    } catch (error) {
        res.status(400).json({
            success: false,
            content: error
        });
    }
}

// Không nhận biết được ngay quyền truy cập API 
router.get('/api/user', auth, UserController.getCurrentUser)
\`\`\`

Sau khi biết đến khái niệm trên, mình đã áp dụng nó vào function **auth**. Lúc này, mình có thể gán trực tiếp quyền truy cập API vào đoạn code routing của mình. 


\`\`\`javascript:user.route.js
const authRolePermission = (user, role) => {
    if (user?.role !== role) {
        throw {
            message: "Not permission"
        }
    }
};

// Sử dụng HOF trả về một hàm
const auth = (role) => {
    return (req, res, next) => {
        try {
            authRolePermission(req.user, role)
            
            next()
        } catch (error) {
            res.status(400).json({
                success: false,
                content: error
            });
        }
    };
};

// Dễ dàng nhận biết ngay quyền truy cập API
router.get('/api/user', auth('admin'), UserController.getCurrentUser)
\`\`\`

**Case 2: Xử lý state của form trong ReactJS**

Thêm 1 ví dụ nữa mình đã sử dụng higher-order function để code trở nên tổng quát hóa.

\`\`\`javascript:form.tsx
// Chưa sử dụng higher-order function
const handleEmail = (e) => {
    setEmail(e.currentTarget.value);
};

const handlePassword = (e) => {
    setPassword(e.currentTarget.value);
};
\`\`\`
\`\`\`javascript:form.jsx
// Sử dụng HOF tổng quát hóa hàm xử lý sự kiện nhập của người dùng
const handleInput = (name) => (e) => {
    switch (name) {
        case "email":
            setEmail(e.currentTarget.value)
            break
        case "password":
            setPassword(e.currentTarget.value)
            break
        default:
            break
    }
}

const handleEmail = handleInput("email")

const handlePassword = handleInput("password")
\`\`\`

# 4. Kết luận
Có rất nhiều ứng dụng HOF để giúp code trở nên clean hơn, hy vọng ví dụ của mình có thể giúp các bạn hiểu hơn về cách sử dụng HOF.
Có góp ý nào về bài viết, mình xin được lắng nghe.
Cảm ơn các bạn đã đọc bài viết của mình.

app.tsx:12 # 1. Higher-order function (HOF) là gì?
Trong Javascript, các function được coi như một giá trị, do đó chúng có thể được gán như một tham số hoặc là một giá trị được trả về của một function khác. Việc làm trên được gọi là sử dụng higher-order function.

Dưới đây là các ví dụ ứng dụng 2 loại triển khai HOF:
* Truyền một function làm tham số của một function khác
* Trả về function từ một function khác

# 2. Truyền một function làm tham số
Ví dụ về chức năng lọc các phần tử chẵn trong mảng. Hàm **isEven** là một HOF và được sự dụng làm tham số của hàm **filter**

\`\`\`javascript
const filter = (arr, fn) => {
    return arr.filter(fn);
};

const isEven = num => {
    return num % 2 === 0;
};

const evenNumbers = filter([1, 2, 3], isEven);
console.log(evenNumbers); // [2]
\`\`\`
# 3. Trả về một function từ một function khác
**Case 1: Phân quyền trong NodeJS**

Dưới đây là đoạn code phân quyền API của mình, lúc này mình chưa biết đến khái niệm higher-order function, do đó code của mình khá khó hiểu cho người mới vào dự án.
\`\`\`javascript:user.route.js
const API_PERMISSION = {
	'/api/user': 'admin'
}

const authRolePermission = (user, role) => {
    if (user?.role !== role) {
        throw {
            message: "Not permission"
        }
    }
};

// Chưa sử dụng higher-order function
const auth = (req, res, next) => {
    try {
        authRolePermission(req.user, API_PERMISSION[req.baseUrl])

        next(); 
    } catch (error) {
        res.status(400).json({
            success: false,
            content: error
        });
    }
}

// Không nhận biết được ngay quyền truy cập API 
router.get('/api/user', auth, UserController.getCurrentUser)
\`\`\`

Sau khi biết đến khái niệm trên, mình đã áp dụng nó vào function **auth**. Lúc này, mình có thể gán trực tiếp quyền truy cập API vào đoạn code routing của mình. 


\`\`\`javascript:user.route.js
const authRolePermission = (user, role) => {
    if (user?.role !== role) {
        throw {
            message: "Not permission"
        }
    }
};

// Sử dụng HOF trả về một hàm
const auth = (role) => {
    return (req, res, next) => {
        try {
            authRolePermission(req.user, role)
            
            next()
        } catch (error) {
            res.status(400).json({
                success: false,
                content: error
            });
        }
    };
};

// Dễ dàng nhận biết ngay quyền truy cập API
router.get('/api/user', auth('admin'), UserController.getCurrentUser)
\`\`\`

**Case 2: Xử lý state của form trong ReactJS**

Thêm 1 ví dụ nữa mình đã sử dụng higher-order function để code trở nên tổng quát hóa.

\`\`\`javascript:form.tsx
// Chưa sử dụng higher-order function
const handleEmail = (e) => {
    setEmail(e.currentTarget.value);
};

const handlePassword = (e) => {
    setPassword(e.currentTarget.value);
};
\`\`\`
\`\`\`javascript:form.jsx
// Sử dụng HOF tổng quát hóa hàm xử lý sự kiện nhập của người dùng
const handleInput = (name) => (e) => {
    switch (name) {
        case "email":
            setEmail(e.currentTarget.value)
            break
        case "password":
            setPassword(e.currentTarget.value)
            break
        default:
            break
    }
}

const handleEmail = handleInput("email")

const handlePassword = handleInput("password")
\`\`\`

# 4. Kết luận
Có rất nhiều ứng dụng HOF để giúp code trở nên clean hơn, hy vọng ví dụ của mình có thể giúp các bạn hiểu hơn về cách sử dụng HOF.
Có góp ý nào về bài viết, mình xin được lắng nghe.
Cảm ơn các bạn đã đọc bài viết của mình.
            `;

          const article = new Article();
          article.title = faker.name.findName();
          article.url = slugify(article.title, {
            replacement: '-', // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true, // convert to lower case, defaults to `false`
            strict: true, // strip special characters except replacement, defaults to `false`
            locale: 'vi', // language code of the locale to use
            trim: true, // trim leading and trailing replacement chars, defaults to `true`
          });
          article.description =
            'The two new keys are aws:EC2InstanceSourceVPC, a condition key that contains the VPC ID to which an EC2 instance is deployed, and aws:EC2InstanceSourcePrivateIPv4, a condition key that contains the primary IPv4 address of the EC2 instance.';
          article.content = mkdStr;
          article.image =
            'https://bb.agency/wp-content/uploads/2022/10/1_FvImgRu1xgrkdeV45Ww5Hg-1400x1050@2x.jpeg';
          article.createdBy = user;
          article.timeToRead = '10min';
          article.visibility = 'public';
          article.topics = topics;

          articles.push(this.articleRepo.save(article));
        });
      });

      articles = await Promise.all(articles);
      articles.forEach((item) => this.articleSearchService.indexArticle(item));

      this.logger.debug('Successfuly completed seeding articles...');
    } catch (error) {
      console.log(error);
      this.logger.error('Failed seeding articles...');
    }
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './Entities/task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/Entities/user.entity';
// import { UserStatus } from '../auth/user-status.enum';
import { UserRole } from '../auth/user-role.enum';
import { ErrorCode } from '../common/exceptions';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    if (user.is_active == true) {
      return this.taskRepository.createTask(createTaskDto, user);
    } else {
      throw new UnauthorizedException(
        'you are not authorized ',
        ErrorCode.ACCESS_DENIED,
      );
    }
  }

  getTasks(user: User): Promise<Task[]> {
    if (user.is_active == true) {
      if (user.role == UserRole.ADMIN) {
        return this.taskRepository.find();
      } else {
        return this.taskRepository.getTask(user);
      }
    } else {
      throw new UnauthorizedException(ErrorCode.ACCESS_DENIED);
    }
  }

  // Retrive the task by specific ID
  async getTaskById(id: number, user: User): Promise<Task> {
    return this.taskRepository.findOne({ where: { id, userId: user.id } });
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    if (user.is_active == true) {
      const task = await this.getTaskById(id, user);
      if (!task) {
        throw new NotFoundException(ErrorCode.TASK_NOT_PRESENT);
      }
      task.status = status;
      task.save();
      return task;
    } else {
      throw new UnauthorizedException(ErrorCode.ACCESS_DENIED);
    }
  }

  async deleteTask(id: number, user: User): Promise<void> {
    if (user.is_active == true) {
      const result = await this.taskRepository.delete({ id, userId: user.id });
      if (result.affected === 0)
        throw new NotFoundException(ErrorCode.TASK_NOT_PRESENT);
    } else {
      throw new UnauthorizedException(ErrorCode.ACCESS_DENIED);
    }
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecordProgressDto } from './dto/record-progress.dto';
import { ProgressEntryEntity } from './entities/progress-entry.entity';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@Controller('readers/:readerId/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Record how far a reader has gotten into a story' })
  @ApiOkResponse({ type: ProgressEntryEntity })
  record(@Param('readerId') readerId: string, @Body() dto: RecordProgressDto): ProgressEntryEntity {
    return this.progressService.recordProgress(readerId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List a reader's progress across every story they have started" })
  @ApiOkResponse({ type: [ProgressEntryEntity] })
  list(@Param('readerId') readerId: string): ProgressEntryEntity[] {
    return this.progressService.getProgress(readerId);
  }
}

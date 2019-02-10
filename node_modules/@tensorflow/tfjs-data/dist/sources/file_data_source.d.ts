import { DataSource } from '../datasource';
import { ByteChunkIterator } from '../iterators/byte_chunk_iterator';
import { FileChunkIteratorOptions } from '../iterators/file_chunk_iterator';
import { FileElement } from '../types';
export declare class FileDataSource extends DataSource {
    protected readonly input: FileElement;
    protected readonly options: FileChunkIteratorOptions;
    constructor(input: FileElement, options?: FileChunkIteratorOptions);
    iterator(): Promise<ByteChunkIterator>;
}

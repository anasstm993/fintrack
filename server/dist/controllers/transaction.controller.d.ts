import { Request, Response, NextFunction } from 'express';
export declare function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function exportTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=transaction.controller.d.ts.map
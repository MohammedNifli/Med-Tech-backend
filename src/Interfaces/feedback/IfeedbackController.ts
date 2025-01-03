import {Request,Response} from 'express'

export interface IfeedbackController{

    addFeedbackAndRating(
        req: Request,
        res: Response
      ): Promise<Response>;
      fetchFeedbackAndRating(
        req: Request,
        res: Response
      ): Promise<Response> 

}
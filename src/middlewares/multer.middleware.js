import multer from "multer";
import { v4 as uuidv4} from "uuid";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/tmp/");
    },
    filename: function (req, file, cb) {
        const uniquSuffix = Date.now() + '-' + uuidv4();
        const extension = file.originalname.split('.').pop();
        cb(null, `${uniquSuffix}.${extension}`);
    }
})

const upload = multer({
    storage: storage,
    limits: {fileSize: 5*1024*1024} // 5 MB Limit
})


export { upload };

-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_FolderID_fkey";

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_FolderID_fkey" FOREIGN KEY ("FolderID") REFERENCES "public"."Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

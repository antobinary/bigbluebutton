/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.presentation;

import com.google.gson.Gson;
import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.imp.PdfPageToImageConversionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class PdfToSwfSlide {
    private static Logger log = LoggerFactory.getLogger(PdfToSwfSlide.class);

    private UploadedPresentation pres;
    private int page;
    private PageConverter pdfToSwfConverter;
    private PdfPageToImageConversionService imageConvertService;
    private String BLANK_SLIDE;
    private int MAX_SWF_FILE_SIZE;

    private volatile boolean done = false;
    private File slide;

    public PdfToSwfSlide(UploadedPresentation pres, int page) {
        this.pres = pres;
        this.page = page;
    }

    public PdfToSwfSlide createSlide() {
        File presentationFile = pres.getUploadedFile();
        slide = new File(presentationFile.getParent() + File.separatorChar + "slide-" + page + ".swf");
        if (!pdfToSwfConverter.convert(presentationFile, slide, page, pres)) {
            Map<String, Object> logData = new HashMap<String, Object>();
            logData.put("meetingId", pres.getMeetingId());
            logData.put("presId", pres.getId());
            logData.put("filename", pres.getName());
            logData.put("page", page);
            logData.put("size(KB)", slide.length() / 1024);

            Gson gson = new Gson();
            String logStr = gson.toJson(logData);

            log.warn("Failed to convert slide: data={}", logStr);

            imageConvertService.convertPageAsAnImage(presentationFile, slide, page, pres);
        }

        // If all fails, generate a blank slide.
        if (!slide.exists()) {
            log.warn("Failed to create slide. Creating blank slide for " + slide.getAbsolutePath());
            generateBlankSlide();
        }

        done = true;

        return this;
    }

    private boolean slideMayHaveTooManyObjects(File slide) {
        // If the resulting swf file is greater than 500K, it probably contains a lot of objects
        // that it becomes very slow to render on the client. Take an image snapshot instead and
        // use it to generate the SWF file. (ralam Sept 2, 2009)
        return slide.length() > MAX_SWF_FILE_SIZE;
    }

    public void generateBlankSlide() {
        if (BLANK_SLIDE != null) {
            Map<String, Object> logData = new HashMap<String, Object>();
            logData.put("meetingId", pres.getMeetingId());
            logData.put("presId", pres.getId());
            logData.put("filename", pres.getName());
            logData.put("page", page);

            Gson gson = new Gson();
            String logStr = gson.toJson(logData);

            log.warn("Creating blank slide: data={}", logStr);

            copyBlankSlide(slide);
        } else {
            Map<String, Object> logData = new HashMap<String, Object>();
            logData.put("meetingId", pres.getMeetingId());
            logData.put("presId", pres.getId());
            logData.put("filename", pres.getName());
            logData.put("page", page);

            Gson gson = new Gson();
            String logStr = gson.toJson(logData);

            log.warn("Failed to create blank slide: data={}", logStr);
        }
    }

    private void copyBlankSlide(File slide) {
        try {
            FileUtils.copyFile(new File(BLANK_SLIDE), slide);
        } catch (IOException e) {
            log.error("IOException while copying blank slide.");
        }
    }

    public void setPageConverter(PageConverter converter) {
        this.pdfToSwfConverter = converter;
    }

    public void setPdfPageToImageConversionService(PdfPageToImageConversionService service) {
        this.imageConvertService = service;
    }

    public void setBlankSlide(String blankSlide) {
        this.BLANK_SLIDE = blankSlide;
    }

    public void setMaxSwfFileSize(int size) {
        this.MAX_SWF_FILE_SIZE = size;
    }

    public boolean isDone() {
        return done;
    }

    public int getPageNumber() {
        return page;
    }
}

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const ScoreTable = ({ scores }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Applicant</TableCell>
                        <TableCell>Skills</TableCell>
                        <TableCell>Experience</TableCell>
                        <TableCell>Education</TableCell>
                        <TableCell>Online Presence</TableCell>
                        <TableCell>Total Score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {scores.map((score, index) => (
                        <TableRow key={score.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{score.name}</TableCell>
                            <TableCell>{score.skills}%</TableCell>
                            <TableCell>{score.experience}%</TableCell>
                            <TableCell>{score.education}%</TableCell>
                            <TableCell>{score.onlinePresence}%</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <StarIcon color="primary" />
                                    <Typography>{score.total}%</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ScoreTable; 
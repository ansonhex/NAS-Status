import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  CircularProgress,
  CircularProgressLabel,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

const getColorScheme = (percentage) => {
  if (percentage < 50) return "green";
  if (percentage < 70) return "yellow";
  return "red";
};

const getTemperatureColor = (temperature) => {
  if (temperature < 70) return "green";
  if (temperature < 80) return "yellow";
  return "red";
};

const Popup = () => {
  const [data, setData] = useState({ cpu: null, ram: null, docker: [] });
  const [loading, setLoading] = useState(false);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cpuResponse, ramResponse, dockerResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/status/cpu`),
          fetch(`${process.env.REACT_APP_API_URL}/status/ram`),
          fetch(`${process.env.REACT_APP_API_URL}/status/docker`),
        ]);

        const [cpu, ram, docker] = await Promise.all([
          cpuResponse.json(),
          ramResponse.json(),
          dockerResponse.json(),
        ]);

        setData({ cpu, ram, docker });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  return (
    <Box bg={bgColor} color={textColor} minH="80vh" p={2}>
      <Heading size="sm" mb={2} textAlign="center">
        NAS Status Monitor
      </Heading>

      <Tabs isFitted variant="soft-rounded" colorScheme="purple">
        <TabList>
          <Tab fontSize={"xs"} >CPU</Tab>
          <Tab fontSize={"xs"} >RAM</Tab>
          <Tab fontSize={"xs"} >Docker</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={2} align="center" minH="100px">
              {data.cpu ? (
                <>
                  <CircularProgress
                    value={data.cpu.averageUsagePercentage}
                    color={`${getColorScheme(data.cpu.averageUsagePercentage)}.400`}
                    size="60px"
                    thickness="12px"
                    capIsRound
                  >
                    <CircularProgressLabel fontSize="xs" fontWeight={"bold"}>
                      {data.cpu.averageUsagePercentage.toFixed(2)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontWeight="bold" textAlign="center">
                    {data.cpu.model}
                  </Text>
                  {/* <Text>Cores: {data.cpu.cores}</Text> */}
                  <Text>Temperature: {data.cpu.temperature || "N/A"}°C</Text>
                </>
              ) : loading ? (
                <Spinner />
              ) : (
                <Text>No CPU data available</Text>
              )}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={2} align="center" minH="100px">
              {data.ram ? (
                <>
                  <CircularProgress
                    value={data.ram.usagePercentage}
                    color={`${getColorScheme(data.ram.usagePercentage)}.400`}
                    size="60px"
                    thickness="12px"
                    capIsRound
                  >
                    <CircularProgressLabel fontSize="xs" fontWeight={"bold"}>
                      {data.ram.usagePercentage.toFixed(2)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text>Total: {data.ram.totalMemory}</Text>
                  <Text>Free: {data.ram.freeMemory}</Text>
                  <Text>Used: {data.ram.usedMemory}</Text>
                </>
              ) : loading ? (
                <Spinner />
              ) : (
                <Text>No RAM data available</Text>
              )}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack align="center" minH="100px">
              {data.docker.length > 0 ? (
                data.docker.map((container) => (
                  <Box key={container.id} p={1} borderWidth={1} borderRadius="md" width="100%">
                    <Text fontWeight="bold">{container.name}</Text>
                    <Text fontSize={"xs"}>{container.status}</Text>
                  </Box>
                ))
              ) : loading ? (
                <Spinner />
              ) : (
                <Text>No Docker containers running</Text>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Popup;
